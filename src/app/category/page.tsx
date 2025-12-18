"use client";
import { Button } from "@/components/Button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, MoreVertical, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  deleteCategory,
  getCategory,
  newCategory,
  updateCategory,
} from "../actions/category.actions";

import { useSession } from "next-auth/react";
import DeleteModal from "@/components/DeleteModal";
import DeleteModalForCategory from "@/components/DeleteModalForCategory";
import Loader from "@/components/Loader";
type Category = {
  _id: string;
  title: string;

  createdAt: string;
};
const Category = () => {
  const [categories, setCategories] = useState<Category[]>();
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [uiUpdate, setUiUpdate] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<{
    title: string;
  }>({
    title: "",
  });

  const [editLoading, setEditLoading] = useState(false);
  const addCategory = async () => {
    setCategoryLoading(true);
    try {
      const res = await newCategory(formData);
      if (res.success) {
        setUiUpdate((prev) => !prev);
        toast.success(res.message);
        setIsDialogOpen(false);
        setFormData({ title: "" });
      } else {
        toast.error(res.message || "failed to create try again");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "failed to create try again");
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    (async function () {
      setLoading(true);
      try {
        const res = await getCategory();
        if (res.success) {
          setCategories(JSON.parse(res.categories!));
        }
      } catch (error) {
        console.log(error);
      }finally{
        setLoading(false);
      }
    })();
  }, [uiUpdate]);

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    setEditLoading(true);
    try {
      const res = await updateCategory(editingCategory._id, editingCategory);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "failed to edit category please try again");
    } finally {
      setUiUpdate((prev) => !prev);
      setEditLoading(false);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    try {
      setDeleteLoading(true);

      const res = await deleteCategory(deleteCategoryId);
      if (res.success) {
        toast.success(res.message);
        setDeleteCategoryId(null);
        setUiUpdate((prev) => !prev);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setDeleteLoading(false);
      setDeleteCategoryId(null);
    }
  };
  if (!mounted || !session) {
    return null;
  }
    if(loading){
      return <Loader />
    }
  return (
    <div>
      <div className="flex justify-between items-center mt-12 w-full mb-6">
        <h2 className="text-[#C27AFF] font-bold text-3xl">Manage Category</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2D1B55] cursor-pointer hover:bg-[#3D2B65] text-white font-semibold flex items-center gap-2">
              <Plus size={18} />
              Add Groups
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#1F133D] text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus size={18} />
                Add New Category
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flrx flex-col gap-3">
                <label htmlFor="category" className="text-right">
                  Title
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      [e.target.name]: e.target.value.toLocaleLowerCase(),
                    }))
                  }
                  name="title"
                  className="col-span-3 bg-[#2D1B55] border-gray-600 text-white"
                  placeholder="Enter category name"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-white cursor-pointer border-gray-600"
                >
                  Cancel
                </Button>
              </DialogTrigger>
              <Button
                onClick={addCategory}
                className="bg-[#C27AFF] hover:bg-[#A55CE6] cursor-pointer text-white font-semibold"
              >
                {categoryLoading ? "Submiting..." : "Add Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-[#2D1B55] bg-[#1F133D] w-full">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-[#2D1B55]">
              <TableHead className="text-gray-300 ">Id</TableHead>
              <TableHead className="text-gray-300">Category Name</TableHead>
              <TableHead className="text-gray-300">Created At</TableHead>
              <TableHead className="text-right text-gray-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories &&
              categories.map((category) => (
                <TableRow className="border-[#2D1B55] hover:bg-[#2D1B55]">
                  <TableCell className="font-medium text-white">
                    {category._id.slice(-3)}
                  </TableCell>
                  <TableCell className="font-medium text-white flex items-center gap-3">
                    {category?.title}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1F133D] border-[#2D1B55]"
                      >
                        <DropdownMenuItem
                          className="hover:bg-[#2D1B55]"
                          onClick={() => setEditingCategory({ ...category })}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 hover:bg-[#2D1B55]"
                          onClick={() => setDeleteCategoryId(category._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        {editingCategory && (
          <DialogContent className="bg-[#1F133D] border-[#2D1B55] text-white">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-name" className="text-right">
                  Title
                </label>
                <Input
                  id="edit-name"
                  value={editingCategory.title}
                  onChange={(e) => {
                    setEditingCategory({
                      ...editingCategory,
                      title: e.target.value,
                    });
                  }}
                  className="col-span-3 bg-[#2D1B55] border-gray-600 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleUpdateCategory}
                className="bg-[#C27AFF] hover:bg-[#A55CE6] text-black font-semibold"
              >
                {editLoading ? "Changing..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      <DeleteModalForCategory
        deleteCategoryId={deleteCategoryId}
        setDeleteCategoryId={setDeleteCategoryId}
        handleDeleteCategory={handleDeleteCategory}
        deleteLoading={deleteLoading}
      />
    </div>
  );
};

export default Category;
