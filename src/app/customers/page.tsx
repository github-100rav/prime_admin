"use client";
import { useEffect, useState } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Search, Filter } from "lucide-react";
import { getUsers } from "../actions/user.action";
import { useSession } from "next-auth/react";

const Customers = () => {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [users, setUsers] = useState<any>();

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async function () {
      try {
        const res = await getUsers();
        if (res.success) {
          setUsers(JSON.parse(res?.users!));
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const filteredCustomers =
    users &&
    users?.filter((user: any) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  if (!mounted || !session) {
    return null;
  }
  return (
    <main className="flex-1 p-6 ">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-[#C27AFF]">
          Customer Management
        </h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              className="pl-10 bg-[#2D1B55] border-gray-600 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-gray-700 bg-[#1F133D]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-white">Customer ID</TableHead>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Contact</TableHead>
              <TableHead className="text-white">Orders</TableHead>
              <TableHead className="text-white">Total Spent</TableHead>
              <TableHead className="text-white">Last Order</TableHead>
              <TableHead className="text-white">Provider</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers && filteredCustomers.length > 0 ? (
              filteredCustomers.map((user: any, index: number) => (
                <TableRow
                  key={user?._id}
                  className="border-gray-700 hover:bg-[#2D1B55]"
                >
                  <TableCell className="font-medium text-white flex gap-3 items-center">
                    <p></p>

                    {index + 1}
                    <img
                      src={user?.image}
                      loading="lazy"
                      className="w-[70px] h-[70px] rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell className="text-white">{user?.name}</TableCell>
                  <TableCell className="text-white">
                    <div>{user?.email}</div>
                    <div className="text-sm text-gray-400">{user?.phone}</div>
                  </TableCell>
                  <TableCell className="text-white">
                    {user?.orderCount}
                  </TableCell>
                  <TableCell className="text-white">
                    {user?.totalSpend}
                  </TableCell>
                  <TableCell className="text-white">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold text-blue-700">
                    {user?.provider.toUpperCase()}
                  </TableCell>
                
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-white">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
};

export default Customers;
