"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { deliverOrder, getOrders } from "../actions/order.action";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Plus,
  Trash2,
} from "lucide-react";
import { SelectValue } from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogDescription } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { default as ReactSelect } from "react-select";
import { productNames } from "../actions/product.actions";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
const Orders = () => {
  const [orders, setOrders] = useState<any>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [uiUpdate, setUiUpdate] = useState(false);
  const [productName, setProductNames] = useState<any>();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async function () {
      setLoading(true);
      try {
        const res = await getOrders(statusFilter, currentPage, itemsPerPage);

        if (res.success) {
          setOrders(JSON.parse(res.orders!));
          setTotalPages(res.totalPages || 1);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [statusFilter, uiUpdate, currentPage, itemsPerPage]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Delivered</Badge>
        );

      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            processing
          </Badge>
        );
      case "cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  useEffect(() => {
    (async function () {
      try {
        const res = await productNames();
        if (res.success) {
          const names = JSON.parse(res.names!);
          setProductNames(() => {
            const products =
              names?.map((name: string) => ({
                label: name,
                value: name,
              })) || [];
            return products;
          });
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const [customerEmail, setCustomerEmail] = useState("");
  const [orderId, setOrderId] = useState();
  const [deliverLoading, setDevliverLoading] = useState(false);
  const [credentials, setCredentials] = useState<any>([
    { product: "", email: "", password: "" },
  ]);
  const addCredential = () => {
    setCredentials([...credentials, { product: "", email: "", password: "" }]);
  };

  const removeCredential = (index: number) => {
    if (credentials.length <= 1) return;
    const updated = [...credentials];
    updated.splice(index, 1);
    setCredentials(updated);
  };

  const updateCredential = (index: number, field: any, value: string) => {
    const updated = [...credentials];
    updated[index][field] = value;
    setCredentials(updated);
  };

  const handleSubmit = async (e: React.FormEvent, orderEmail: string) => {
    e.preventDefault();

    try {
      if (!orderId) {
        toast.error("order id????");
        return;
      }

      setDevliverLoading(true);

      const res = await deliverOrder(orderEmail, credentials, orderId);
      if (res.success) {
        setUiUpdate((prev) => !prev);
        toast.success(res.message);
        setCredentials([]);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDevliverLoading(false);
    }
  };

  if (!mounted || !session) {
    return null;
  }


  return (
    <main className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#C27AFF]">Manage Orders</h1>
        <div className="flex gap-4">
          <Button className="bg-[#C27AFF] hover:bg-[#A55CE6] text-black font-semibold">
            Export Orders
          </Button>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-full md:w-40 bg-[#2D1B55] border-gray-600 text-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter status" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#2D1B55] text-white border-gray-600">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="processing">processing</SelectItem>
              <SelectItem value="delivered">delivered</SelectItem>
              <SelectItem value="cancelled">cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-gray-700 bg-[#1F133D]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-white">Order ID</TableHead>
              <TableHead className="text-white">Customer</TableHead>
              <TableHead className="text-white">Product</TableHead>
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Transcation Id</TableHead>

              <TableHead className="text-right text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? (
            <TableCell className="text-white">loading...</TableCell>
          ) : (
            <TableBody>
              {orders ? (
                orders.map((order: any, orderIndex: number) => (
                  <TableRow
                    key={order._id}
                    className="border-gray-700 hover:bg-[#2D1B55]"
                  >
                    <TableCell className="font-medium text-white">
                      {orderIndex + 1}
                    </TableCell>
                    <TableCell className="text-white">
                      {order?.user?.name}
                    </TableCell>
                    <TableCell className="text-white flex flex-col gap-1">
                      {order?.products?.map((p: any) => (
                        <div key={p._id} className="flex gap-2">
                          <p>{p?.product?.title}</p>
                          <p className="font-bold text-red-400">
                            ({p.quantity})
                          </p>
                        </div>
                      ))}
                      {order?.comment && (
                        <a href={order?.comment} className="text-red-500" target="_blank">Course Link</a>
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {order.totalAmount}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-white">
                      {new Date(order.createdAt).toLocaleDateString()} (
                      {new Date(order.createdAt).toLocaleTimeString()})
                    </TableCell>
                    <TableCell>{order?.transactionId}</TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`${
                              order?.status === "delivered"
                                ? "bg-[#03522a]"
                                : "bg-[#3b0966]"
                            } text-white hover:text-[#A55CE6] cursor-pointer`}
                            onClick={() => {
                              setOrderId(order?._id);
                            }}
                          >
                            {order?.status === "delivered"
                              ? "Delivered"
                              : "Send Credentials"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[730px] bg-[#1F133D] text-white z-[110] overflow-y-auto  h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>
                              Deliver Product Credentials
                            </DialogTitle>
                            <DialogDescription>
                              Enter product access credentials and the
                              customer's email to deliver.
                            </DialogDescription>
                          </DialogHeader>

                          <form
                            onSubmit={(e) =>
                              handleSubmit(e, order?.user?.email)
                            }
                          >
                            <div className="flex flex-col gap-2">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                  htmlFor="customerEmail"
                                  className="text-right"
                                >
                                  Customer Email
                                </Label>
                                <Input
                                  id="customerEmail"
                                  type="email"
                                  className="col-span-3 bg-[#2A1B4D] border-[#3E2A6D] text-white"
                                  placeholder="customer@example.com"
                                  required
                                  value={order?.user?.email}
                                  onChange={(e) => {
                                    setCustomerEmail(order?.user?.email);
                                  }}
                                />
                              </div>

                              <div className="flex flex-col gap-2 mt-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium">
                                    Product Credentials
                                  </h4>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-[#C27AFF] border-[#3E2A6D] hover:bg-[#2A1B4D]"
                                    onClick={addCredential}
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Another
                                  </Button>
                                </div>

                                <div className="flex flex-col gap-3">
                                  {credentials &&
                                    credentials.map(
                                      (credential: any, index: number) => (
                                        <div
                                          key={index}
                                          className="flex flex-col gap-2"
                                        >
                                          <div className="flex flex-wrap gap-2">
                                            <div className="flex-1 min-w-[200px]">
                                              {productName ? (
                                                <ReactSelect
                                                  options={productName}
                                                  value={
                                                    productName?.find(
                                                      (option: any) =>
                                                        option.value ===
                                                        credentials[index]
                                                          ?.product
                                                    ) || null
                                                  }
                                                  onChange={(selectedOption) =>
                                                    updateCredential(
                                                      index,
                                                      "product",
                                                      selectedOption?.value ||
                                                        ""
                                                    )
                                                  }
                                                  placeholder="Select Product"
                                                />
                                              ) : (
                                                "Loading..."
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-[200px]">
                                              <Input
                                                type="text"
                                                className="bg-[#2A1B4D] border-[#3E2A6D] text-white"
                                                placeholder="product-email@example.com"
                                                required
                                                value={credential.email}
                                                onChange={(e) =>
                                                  updateCredential(
                                                    index,
                                                    "email",
                                                    e.target.value
                                                  )
                                                }
                                              />
                                            </div>
                                            <div className="flex-1 min-w-[200px]">
                                              <Input
                                                type="text"
                                                className="bg-[#2A1B4D] border-[#3E2A6D] text-white"
                                                placeholder="Password"
                                                required
                                                value={credential.password}
                                                onChange={(e) =>
                                                  updateCredential(
                                                    index,
                                                    "password",
                                                    e.target.value
                                                  )
                                                }
                                              />
                                            </div>
                                            <div className="flex-1 min-w-[200px]">
                                              <select
                                                value={
                                                  credential.status ||
                                                  "processing"
                                                }
                                                onChange={(e) =>
                                                  updateCredential(
                                                    index,
                                                    "status",
                                                    e.target.value as
                                                      | "processing"
                                                      | "delivered"
                                                      | "cancelled"
                                                  )
                                                }
                                                className="bg-[#2A1B4D] border-[#3E2A6D] text-white rounded-md px-3 py-2 w-full"
                                              >
                                                <option value="processing">
                                                  Processing
                                                </option>
                                                <option value="delivered">
                                                  Delivered
                                                </option>
                                                <option value="cancelled">
                                                  Cancelled
                                                </option>
                                              </select>
                                            </div>
                                          </div>
                                          <div className="w-full">
                                            <Textarea
                                              className="bg-[#2A1B4D] border-[#3E2A6D] text-white w-full min-h-[100px]"
                                              placeholder="Message"
                                              required
                                              value={credential.message}
                                              onChange={(e) =>
                                                updateCredential(
                                                  index,
                                                  "message",
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </div>
                                          <div className="flex justify-end">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="text-red-500 hover:bg-red-500/10"
                                              onClick={() =>
                                                removeCredential(index)
                                              }
                                              disabled={credentials.length <= 1}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      )
                                    )}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                className="bg-[#C27AFF] hover:bg-[#A55CE6] text-white cursor-pointer mt-2"
                              >
                                {deliverLoading
                                  ? "sending..."
                                  : "Send Credentials"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableCell>Data is not fond</TableCell>
              )}
            </TableBody>
          )}
        </Table>
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="flex items-center space-x-6">
            {/* Page info */}
            <div className="text-sm font-medium text-purple-200">
              Page {currentPage} of {totalPages}
            </div>

            {/* Navigation buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-[#2D1B55] border-[#3E2A6D] text-purple-100 hover:bg-[#3E2A6D] hover:text-white"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1 || loading}
              >
                <span className="sr-only">First page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-[#2D1B55] border-[#3E2A6D] text-purple-100 hover:bg-[#3E2A6D] hover:text-white"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
              >
                <span className="sr-only">Previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page number buttons (shows up to 5 pages around current page) */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      currentPage === pageNum
                        ? "bg-[#C27AFF] text-white"
                        : "bg-[#2D1B55] border-[#3E2A6D] text-purple-100 hover:bg-[#3E2A6D] hover:text-white"
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-[#2D1B55] border-[#3E2A6D] text-purple-100 hover:bg-[#3E2A6D] hover:text-white"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || loading}
              >
                <span className="sr-only">Next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-[#2D1B55] border-[#3E2A6D] text-purple-100 hover:bg-[#3E2A6D] hover:text-white"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || loading}
              >
                <span className="sr-only">Last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Orders;
