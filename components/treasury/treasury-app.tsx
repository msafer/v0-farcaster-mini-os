export function TreasuryApp() {
  const stats = [
    { label: "System Uptime", value: "99.9%" },
    { label: "Active Users", value: "1,337" },
    { label: "Daily Posts", value: "420" },
    { label: "Maintenance Fee", value: "0.001 ETH" },
  ]

  return (
    <div className="h-full bg-gray-200 p-4">
      <div className="pixel-border bg-white h-full p-4">
        <h2 className="text-lg font-bold mb-4 text-black">System Treasury</h2>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="pixel-border bg-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-black mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 pixel-border bg-gray-100 p-4">
          <h3 className="font-semibold mb-2 text-black">System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-black">Database</span>
              <span className="text-green-600">●</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">API</span>
              <span className="text-green-600">●</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black">Storage</span>
              <span className="text-green-600">●</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
