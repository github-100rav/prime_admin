"use client";
import { useCallback, useEffect, useState } from "react";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Trash2,
  Edit,
  Plus,
  ImageIcon,
  Delete,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "recharts";
import toast from "react-hot-toast";
import {
  deleteGroup,
  getGroup,
  newGroup,
  updateGroup,
} from "../actions/group.action";
import Image from "next/image";
import DeleteModal from "@/components/DeleteModal";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";

type Group = {
  _id: string;
  title: string;
  slug: string;
  status: "active" | "inactive";
  logoImage: File | undefined;
  createdAt: string;
};

const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>();
  const [groupLoading, setGroupLoading] = useState(false);
  const [uiUpdate, setUiUpdate] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLogoImage, setEditLogoImage] = useState("");
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>();
  const [editLoading, setEditLoading] = useState(false);
  const [loading,setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    logoImage: File | null;
  }>({
    title: "",
    logoImage: null,
    slug: "",
  });


  const addGroup = async () => {
    setGroupLoading(true);
    try {
      const res = await newGroup(formData);
      if (res.success) {
        setUiUpdate((prev) => !prev);
        toast.success(res.message);
        setIsDialogOpen(false);
        setFormData({ title: "", logoImage: null, slug: "" });
        setLogoPreview(undefined);
      } else {
        toast.error(res.message || "failed to create try again");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "failed to create try again");
    } finally {
      setGroupLoading(false);
    }
  };

  const handleFileChange = useCallback(
    (
      field: "logoImage" | "images" | "editLogoImage",
      files: FileList | null
    ) => {
      if (!files) return;
      if (field === "logoImage") {
        const reader = new FileReader();
        reader.onload = (e) =>
          e.target?.result && setLogoPreview(e.target.result as string);
        reader.readAsDataURL(files[0]);
      }
      if (field === "editLogoImage") {
        setEditingGroup((prev: any) => ({ ...prev, ["logoImage"]: files }));
        const reader = new FileReader();
        reader.onload = (e) =>
          e.target?.result && setEditLogoImage(e.target.result as string);
        reader.readAsDataURL(files[0]);
      } else {
        setFormData((prev) => ({ ...prev, [field]: files }));
      }
    },
    []
  );

  useEffect(() => {
    (async function () {
      try {
        setLoading(true);
        const res = await getGroup();
        if (res.success) {
          setGroups(JSON.parse(res.groups!));
        }
      } catch (error) {
        console.log(error);
      }finally{
        setLoading(false);
      }
    })();
  }, [uiUpdate]);

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    setEditLoading(true);
    try {
      const res = await updateGroup(editingGroup._id, editingGroup);
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
      setEditingGroup(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupId) return;
    try {
      setDeleteLoading(true);

      const res = await deleteGroup(deleteGroupId);
      if (res.success) {
        toast.success(res.message);
        setDeleteGroupId(null);
        setUiUpdate((prev) => !prev);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setDeleteLoading(false);
      setDeleteGroupId(null);
    }
  };

  const getStatusBadge = (status: "active" | "inactive") => {
    return status === "active" ? (
      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
    ) : (
      <Badge className="bg-yellow-500 hover:bg-yellow-600">Inactive</Badge>
    );
  };
  if (!mounted || !session) {
    return null;
  }

  if(loading){
    return <Loader />
  }
  return (
    <main className="flex-1 p-6 w-full">
      <div className="flex justify-between items-center mb-6 w-full">
        <h1 className="text-3xl font-bold text-[#C27AFF]">Manage Groups</h1>

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
                Add New Group
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
                    setFormData((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  name="title"
                  className="col-span-3 bg-[#2D1B55] border-gray-600 text-white"
                  placeholder="Enter category name"
                />
              </div>
              <div className="flrx flex-col gap-3">
                <label htmlFor="category" className="text-right">
                  Slug
                </label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value,
                    }))
                  }
                  name="slug"
                  className="col-span-3 bg-[#2D1B55] border-gray-600 text-white"
                  placeholder="amazon-1-year"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#E2E8F0] text-sm font-medium">
                    Logo Image
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange("logoImage", e.target.files)
                      }
                      className="bg-[#1E293B] h-10 border-[#C27AFF] text-white file:bg-[#7C3AED] file:text-white file:border-0 file:rounded-md file:px-4 file:py-1"
                    />
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-12 w-12 rounded-lg object-cover border border-[#C27AFF]"
                      />
                    )}
                  </div>
                </div>
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
                onClick={addGroup}
                className="bg-[#C27AFF] hover:bg-[#A55CE6] cursor-pointer text-white font-semibold"
              >
                {groupLoading ? "Submiting..." : "Add Group"}
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
              <TableHead className="text-gray-300">Logo</TableHead>
              <TableHead className="text-gray-300">Group Name</TableHead>
              <TableHead className="text-gray-300">Slug</TableHead>

              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Created At</TableHead>
              <TableHead className="text-right text-gray-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups &&
              groups.map((group, index) => (
                <TableRow
                  key={group._id}
                  className="border-[#2D1B55] hover:bg-[#2D1B55]"
                >
                  <TableCell className="font-medium text-white">
                    {index + 1}
                  </TableCell>

                  <TableCell className="font-medium text-white flex items-center gap-3">
                    {group.logoImage ? (
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={group.logoImage as any}
                          alt={group.title}
                          fill
                          className="h-[100px] w-[100p] rounded-full object-cover"
                          style={{ objectPosition: "center" }}
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-[#2D1B55] flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {group.title}
                  </TableCell>
                  <TableCell className="text-white">{group.slug}</TableCell>
                  <TableCell>{getStatusBadge(group.status)}</TableCell>
                  <TableCell className="text-white">
                    {new Date(group.createdAt).toLocaleDateString()}
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
                          onClick={() => setEditingGroup({ ...group })}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 hover:bg-[#2D1B55]"
                          onClick={() => setDeleteGroupId(group._id)}
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
        open={!!editingGroup}
        onOpenChange={(open) => !open && setEditingGroup(null)}
      >
        {editingGroup && (
          <DialogContent className="bg-[#1F133D] border-[#2D1B55] text-white">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-name" className="text-right">
                  Title
                </label>
                <Input
                  id="edit-name"
                  value={editingGroup.title}
                  onChange={(e) => {
                    setEditingGroup({
                      ...editingGroup,
                      title: e.target.value,
                    });
                  }}
                  className="col-span-3 bg-[#2D1B55] border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-slug" className="text-right">
                  Slug
                </label>
                <Input
                  id="edit-slug"
                  value={editingGroup.slug}
                  onChange={(e) =>
                    setEditingGroup({
                      ...editingGroup,
                      slug: e.target.value,
                    })
                  }
                  className="col-span-3 bg-[#2D1B55] border-gray-600 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-status" className="text-right">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editingGroup.status}
                  onChange={(e) =>
                    setEditingGroup({
                      ...editingGroup,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                  className="col-span-3 bg-[#2D1B55] border-gray-600 text-white p-2 rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#E2E8F0] text-sm font-medium">
                    Logo Image
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileChange("editLogoImage", e.target.files)
                      }
                      className="bg-[#1E293B] h-10 border-[#C27AFF] text-white file:bg-[#7C3AED] file:text-white file:border-0 file:rounded-md file:px-4 file:py-1"
                    />

                    {editLogoImage ? (
                      <img
                        src={editLogoImage}
                        alt="Logo preview"
                        className="h-12 w-12 rounded-lg object-cover border border-[#C27AFF]"
                      />
                    ) : editingGroup.logoImage ? (
                      <img
                        src={String(editingGroup.logoImage)}
                        alt="Logo preview"
                        className="h-12 w-12 rounded-lg object-cover border border-[#C27AFF]"
                      />
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleUpdateGroup}
                className="bg-[#C27AFF] hover:bg-[#A55CE6] text-black font-semibold"
              >
                {editLoading ? "Changing..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      <DeleteModal
        deleteGroupId={deleteGroupId}
        setDeleteGroupId={setDeleteGroupId}
        handleDeleteGroup={handleDeleteGroup}
        deleteLoading={deleteLoading}
      />
    </main>
  );
};

export default GroupsPage;
