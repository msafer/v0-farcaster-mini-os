import { PrismaClient } from '@prisma/client';
import { startOfDay, format } from 'date-fns';
import { AppError, type TaskResponse, type DailyTaskData } from '../types/index.js';
import { CreditsService } from './credits.js';
import { CREDIT_REASONS } from '../types/index.js';

export class TasksService {
  constructor(
    private prisma: PrismaClient,
    private creditsService: CreditsService
  ) {}

  async getTodaysTasks(userId: string): Promise<TaskResponse[]> {
    const today = startOfDay(new Date());
    const dateKey = format(today, 'yyyy-MM-dd');

    // Get or create today's tasks
    let dailyTask = await this.prisma.dailyTask.findUnique({
      where: { dateUtc: today },
      include: {
        completions: {
          where: { userId },
          select: { taskId: true }
        }
      }
    });

    if (!dailyTask) {
      // Generate today's tasks
      const tasks = this.generateDailyTasks();
      dailyTask = await this.prisma.dailyTask.create({
        data: {
          dateUtc: today,
          tasksJson: tasks
        },
        include: {
          completions: {
            where: { userId },
            select: { taskId: true }
          }
        }
      });
    }

    const completedTaskIds = new Set(dailyTask.completions.map(c => c.taskId));
    const tasks = dailyTask.tasksJson as DailyTaskData[];

    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      rewardType: task.rewardType,
      completed: completedTaskIds.has(task.id)
    }));
  }

  async completeTask(userId: string, taskId: string): Promise<{ success: boolean; reward: string }> {
    const today = startOfDay(new Date());

    const dailyTask = await this.prisma.dailyTask.findUnique({
      where: { dateUtc: today }
    });

    if (!dailyTask) {
      throw new AppError(404, 'No tasks available for today');
    }

    const tasks = dailyTask.tasksJson as DailyTaskData[];
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    // Check if already completed
    const existingCompletion = await this.prisma.taskCompletion.findUnique({
      where: {
        taskId_userId_dailyTaskId: {
          taskId,
          userId,
          dailyTaskId: dailyTask.id
        }
      }
    });

    if (existingCompletion) {
      throw new AppError(400, 'Task already completed');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Mark task as completed
      await tx.taskCompletion.create({
        data: {
          taskId,
          userId,
          dailyTaskId: dailyTask.id
        }
      });

      // Grant the daily free based on reward type
      const rewardMessage = task.rewardType === 'free_image' 
        ? 'Free image post granted for today!'
        : 'Free like granted for today!';

      // The actual free usage will be tracked when the user tries to post/like
      // We just record the completion here

      // Optional: Grant some credits as additional reward
      await this.creditsService.grantCredits(
        userId, 
        10, // 10 cents bonus
        CREDIT_REASONS.TASK_COMPLETION,
        { taskId, rewardType: task.rewardType }
      );

      return {
        success: true,
        reward: `${rewardMessage} Plus 10¢ bonus credits!`
      };
    });
  }

  async getUserTaskStats(userId: string): Promise<{ completedToday: number; totalCompleted: number }> {
    const today = startOfDay(new Date());

    const [completedToday, totalCompleted] = await Promise.all([
      this.prisma.taskCompletion.count({
        where: {
          userId,
          completedAt: {
            gte: today
          }
        }
      }),
      this.prisma.taskCompletion.count({
        where: { userId }
      })
    ]);

    return { completedToday, totalCompleted };
  }

  private generateDailyTasks(): DailyTaskData[] {
    const taskTemplates = [
      {
        title: 'Welcome Back!',
        description: 'Log in to Snel OS today',
        rewardType: 'free_image' as const,
      },
      {
        title: 'Social Butterfly',
        description: 'Like 3 posts from other users',
        rewardType: 'free_like' as const,
      },
      {
        title: 'Content Creator',
        description: 'Post an image to your feed',
        rewardType: 'free_image' as const,
      },
      {
        title: 'Note Taker',
        description: 'Create a public note',
        rewardType: 'free_like' as const,
      },
      {
        title: 'Explorer',
        description: 'Search for new users to follow',
        rewardType: 'free_image' as const,
      },
      {
        title: 'Community Member',
        description: 'Check the treasury status',
        rewardType: 'free_like' as const,
      }
    ];

    // Select 3-4 random tasks for today
    const selectedTasks = taskTemplates
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 3); // 3-4 tasks

    return selectedTasks.map((template, index) => ({
      id: `task_${Date.now()}_${index}`,
      title: template.title,
      description: template.description,
      rewardType: template.rewardType,
      meta: {}
    }));
  }
}
