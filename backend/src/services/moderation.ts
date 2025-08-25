import { PrismaClient } from '@prisma/client';
import { AppError, type ReportRequest } from '../types/index.js';

export class ModerationService {
  constructor(private prisma: PrismaClient) {}

  async submitReport(reporterId: string, report: ReportRequest): Promise<{ id: string; status: string }> {
    // Validate target exists
    await this.validateReportTarget(report.targetType, report.targetId);

    const newReport = await this.prisma.report.create({
      data: {
        reporterId,
        targetType: report.targetType,
        targetId: report.targetId,
        reason: report.reason,
        status: 'pending'
      }
    });

    // Auto-moderate based on simple rules
    await this.autoModerate(newReport.id, report);

    return {
      id: newReport.id,
      status: newReport.status
    };
  }

  async getReports(status?: string, limit = 50, offset = 0): Promise<any[]> {
    const whereClause = status ? { status } : {};

    const reports = await this.prisma.report.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: {
            fid: true,
            fname: true
          }
        }
      }
    });

    return reports.map(report => ({
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
      reviewedAt: report.reviewedAt?.toISOString(),
      reporter: report.reporter
    }));
  }

  async reviewReport(reportId: string, action: 'approve' | 'dismiss', moderatorId?: string): Promise<void> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      throw new AppError(404, 'Report not found');
    }

    if (report.status !== 'pending') {
      throw new AppError(400, 'Report already reviewed');
    }

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'approve' ? 'approved' : 'dismissed',
        reviewedAt: new Date()
      }
    });

    if (action === 'approve') {
      await this.executeModeractionAction(report);
    }
  }

  async getModerationStats(): Promise<any> {
    const [pending, approved, dismissed, totalReports] = await Promise.all([
      this.prisma.report.count({ where: { status: 'pending' } }),
      this.prisma.report.count({ where: { status: 'approved' } }),
      this.prisma.report.count({ where: { status: 'dismissed' } }),
      this.prisma.report.count()
    ]);

    return {
      pending,
      approved,
      dismissed,
      totalReports,
      automatedActions: 0 // Would track auto-moderation actions
    };
  }

  async flagContent(targetType: string, targetId: string, reason: string): Promise<void> {
    // Soft delete or flag content
    switch (targetType) {
      case 'post':
        // In a real system, you might soft-delete or hide the post
        break;
      case 'chat_message':
        await this.prisma.chatMessage.delete({
          where: { id: targetId }
        });
        break;
      case 'user':
        // Implement user suspension logic
        break;
    }
  }

  private async validateReportTarget(targetType: string, targetId: string): Promise<void> {
    let exists = false;

    switch (targetType) {
      case 'post':
        exists = !!(await this.prisma.post.findUnique({ where: { id: targetId } }));
        break;
      case 'user':
        exists = !!(await this.prisma.user.findUnique({ where: { id: targetId } }));
        break;
      case 'chat_message':
        exists = !!(await this.prisma.chatMessage.findUnique({ where: { id: targetId } }));
        break;
      default:
        throw new AppError(400, 'Invalid target type');
    }

    if (!exists) {
      throw new AppError(404, 'Report target not found');
    }
  }

  private async autoModerate(reportId: string, report: ReportRequest): Promise<void> {
    // Simple auto-moderation rules
    const autoApproveReasons = ['spam', 'inappropriate', 'harmful'];
    
    if (autoApproveReasons.includes(report.reason.toLowerCase())) {
      // Auto-approve obvious violations
      await this.prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'approved',
          reviewedAt: new Date()
        }
      });

      // Execute moderation action
      const fullReport = await this.prisma.report.findUnique({ where: { id: reportId } });
      if (fullReport) {
        await this.executeModeractionAction(fullReport);
      }
    }
  }

  private async executeModeractionAction(report: any): Promise<void> {
    // Execute the actual moderation action
    switch (report.targetType) {
      case 'post':
        // Hide or delete the post
        // await this.prisma.post.delete({ where: { id: report.targetId } });
        break;
      case 'chat_message':
        await this.prisma.chatMessage.delete({ where: { id: report.targetId } });
        break;
      case 'user':
        // Implement user suspension
        break;
    }
  }
}
