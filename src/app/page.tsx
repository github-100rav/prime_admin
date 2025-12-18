"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreVertical } from "lucide-react";
import { getDashboardData } from "./actions/dashboard.action";
import { Skeleton } from "@/components/ui/skeleton";
import Loading from "@/components/Loader";

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  productsSold: number;
  recentOrders: {
    id: string;
    customer: string;
    product: string;
    amount: string;
    status: string;
    date: string;
  }[];
  topProducts: {
    name: string;
    sales: number;
    revenue: string;
  }[];
  salesByCategory: {
    name: string;
    value: number;
  }[];
  performanceMetrics: {
    name: string;
    value: string;
    change: string;
  }[];
  chartData: {
    monthly: {
      name: string;
      revenue: number;
      orders: number;
    }[];
    weekly: {
      name: string;
      revenue: number;
      orders: number;
    }[];
  };
}

const COLORS = ["#C27AFF", "#A55CE6", "#883DCC", "#6B1FB3", "#4A148C"];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardData();

        if (res.success && res.data) {
          const parsedData = JSON.parse(res.data);
      

          const transformedData: DashboardData = {
            ...parsedData,
            recentOrders: parsedData.recentOrders.map((order: any) => ({
              ...order,
              amount: `₹${order.amount.replace("₹", "")}`, // Ensure consistent formatting
            })),
            topProducts: parsedData.topProducts.map((product: any) => ({
              ...product,
              revenue: `₹${product.revenue.replace("₹", "")}`, // Ensure consistent formatting
            })),
          };

          setData(transformedData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="text-center p-6">
          <CardTitle className="text-red-500 mb-4">
            Error Loading Data
          </CardTitle>
        </Card>
      </div>
    );
  }
  return (
    <>
      {data && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <TimeRangeSelector
              timeRange={timeRange}
              setTimeRange={setTimeRange}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Revenue"
              value={`₹${data.totalRevenue.toLocaleString("en-IN")}`}
              icon="currency"
              change="+12.5%"
            />
            <StatCard
              title="Total Orders"
              value={data.totalOrders.toLocaleString("en-IN")}
              icon="orders"
              change="+8.3%"
            />
            <StatCard
              title="Active Users"
              value={data.totalUsers.toLocaleString("en-IN")}
              icon="users"
              change="+5.2%"
            />
            <StatCard
              title="Products Sold"
              value={data?.productsSold?.toLocaleString("en-IN")}
              icon="products"
              change="+15.7%"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard
              title="Revenue Overview"
              description={`${
                timeRange === "week" ? "Weekly" : "Monthly"
              } revenue trends`}
            >
              <RevenueChart
                data={
                  timeRange === "week"
                    ? data.chartData.weekly
                    : data.chartData.monthly
                }
              />
            </ChartCard>

            <ChartCard
              title="Orders Overview"
              description={`${
                timeRange === "week" ? "Weekly" : "Monthly"
              } order trends`}
            >
              <OrdersChart
                data={
                  timeRange === "week"
                    ? data.chartData.weekly
                    : data.chartData.monthly
                }
              />
            </ChartCard>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentOrdersTable
              orders={data.recentOrders}
              className="lg:col-span-2"
            />

            <div className="space-y-6">
              <SalesByCategoryChart data={data.salesByCategory} />

              <TopProductsList products={data.topProducts} />
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {data.performanceMetrics.map((metric, index) => (
              <PerformanceMetricCard
                key={index}
                metric={metric}
                timeRange={timeRange}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}


// Component for the time range selector
function TimeRangeSelector({
  timeRange,
  setTimeRange,
}: {
  timeRange: "week" | "month";
  setTimeRange: (range: "week" | "month") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {timeRange === "week" ? "Weekly" : "Monthly"} View
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTimeRange("week")}>
          Weekly
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTimeRange("month")}>
          Monthly
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Component for stat cards
function StatCard({
  title,
  value,
  icon,
  change,
}: {
  title: string;
  value: string;
  icon: "currency" | "orders" | "users" | "products";
  change: string;
}) {
  const iconMap = {
    currency: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    orders: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2v20M18 2v20M18 2v20" />
        <path d="M6 2h12" />
        <path d="M6 12h12" />
        <path d="M6 22h12" />
      </svg>
    ),
    users: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    products: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 7h-4V5c0-.55-.22-1.05-.59-1.41C15.05 3.22 14.55 3 14 3h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z" />
      </svg>
    ),
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-purple-500">{iconMap[icon]}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-green-500 mt-1">{change}</p>
      </CardContent>
    </Card>
  );
}

// Component for chart cards
function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-80">{children}</CardContent>
    </Card>
  );
}

// Component for revenue chart
function RevenueChart({ data }: { data: { name: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          name="Revenue (₹)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Component for orders chart
function OrdersChart({ data }: { data: { name: string; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="orders"
          fill="#82ca9d"
          name="Orders"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Component for recent orders table
function RecentOrdersTable({
  orders,
  className,
}: {
  orders: DashboardData["recentOrders"];
  className?: string;
}) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <Badge variant="destructive">Delivered</Badge>;
      case "processing":
        return <Badge variant="secondary">Processing</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders from your store</CardDescription>
          </div>
          <Button variant="ghost">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.product}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
               
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Component for sales by category chart
function SalesByCategoryChart({
  data,
}: {
  data: DashboardData["salesByCategory"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription>
          Distribution of sales across categories
        </CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
           
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} sold`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Component for top products list
function TopProductsList({
  products,
}: {
  products: DashboardData["topProducts"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Best performing products</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.map((product, index) => (
          <div key={index} className="flex items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {product.sales} sold
              </p>
            </div>
            <div className="ml-auto font-medium">{product.revenue}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Component for performance metrics
function PerformanceMetricCard({
  metric,
  timeRange,
}: {
  metric: DashboardData["performanceMetrics"][0];
  timeRange: "week" | "month";
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <p
          className={`text-xs mt-1 ${
            metric.change.startsWith("+") ? "text-green-500" : "text-red-500"
          }`}
        >
          {metric.change} from last {timeRange}
        </p>
      </CardContent>
    </Card>
  );
}
