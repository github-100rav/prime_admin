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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import AddProductForm from "@/components/AddProduct";
import { deleteProduct, getProduct } from "../actions/product.actions";
import { Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { newGroup } from "../actions/group.action";
import toast from "react-hot-toast";
import DeleteModal from "@/components/DeleteModal";
import EditProductDialog from "@/components/EditProduct";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  originalPrice: number;
  logoImage: string;
  category: string;
  group: string;
  stock: number;
  features: string[];
  images: string[];
};
const Products = () => {
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductAdded, setIsProductAdded] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uiUpdate, setUiUpdate] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>();
  const [editDialgBox, setEditDialgBox] = useState(false);
  const [editProduct, setEditProduct] = useState<any>();

  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    logoImage: File | null;
  }>({
    title: "",
    logoImage: null,
    slug: "",
  });
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addCategory = async () => {
    setProductLoading(true);
    try {
      const res = await newGroup(formData);
      if (res.success) {
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
      setProductLoading(false);
    }
  };
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const product = await getProduct();

        setProducts(product.data || []);

        if (!product.success) {
          setError(product.message || "Error fetching products");
     
        } 
      } catch (error: any) {
        setError(error.message || "An unexpected error occurred");
        setTimeout(() => {
          setError("");
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [uiUpdate]);

  const handleFileChange = useCallback(
    (field: "logoImage" | "images", files: FileList | null) => {
      if (!files) return;

      setFormData((prev) => ({ ...prev, [field]: files }));

      if (field === "logoImage") {
        const reader = new FileReader();
        reader.onload = (e) =>
          e.target?.result && setLogoPreview(e.target.result as string);
        reader.readAsDataURL(files[0]);
      }
    },
    []
  );

  const handleDeleteGroup = async () => {
    if (!deleteProductId) return;
    try {
      setDeleteLoading(true);

      const res = await deleteProduct(deleteProductId);
      if (res.success) {
        toast.success(res.message);
        setDeleteProductId(null);
        setUiUpdate((prev) => !prev);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message);
      console.log(error);
    } finally {
      setDeleteLoading(false);
      setDeleteProductId(null);
    }
  };
  if (!mounted || !session) {
    return null;
  }
  if (isLoading) {
    return <Loader />;
  }

  return (
    <main className="flex-1 p-6">
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <div>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      <DeleteModal
        deleteGroupId={deleteProductId}
        setDeleteGroupId={setDeleteProductId}
        handleDeleteGroup={handleDeleteGroup}
        deleteLoading={deleteLoading}
      />
      {!isProductAdded ? (
        <>
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h1 className="text-3xl mb-4 font-bold text-[#C27AFF]">
              Manage Products
            </h1>
            <div className="flex gap-4">
              <Button
                onClick={() => setIsProductAdded(true)}
                className="bg-[#C27AFF] hover:bg-[#A55CE6] text-white font-semibold flex items-center gap-2"
              >
                <Plus size={18} />
                Add Product
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2D1B55] hover:bg-[#3D2B65] text-white font-semibold flex items-center gap-2">
                    <Plus size={18} />
                    Add Category
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
                        className="text-white border-gray-600"
                      >
                        Cancel
                      </Button>
                    </DialogTrigger>
                    <Button
                      onClick={addCategory}
                      className="bg-[#C27AFF] hover:bg-[#A55CE6] text-white font-semibold"
                    >
                      {productLoading ? "Submiting..." : "Add Category"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-[#1F133D] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-white w-[200px]">ID</TableHead>

                  <TableHead className="text-white w-[200px]">
                    Product
                  </TableHead>
                  <TableHead className="text-white">Details</TableHead>
                  <TableHead className="text-white">Pricing</TableHead>
                  <TableHead className="text-white">Stock</TableHead>
                  <TableHead className="text-white">Category</TableHead>
                  <TableHead className="text-right text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <TableRow
                      key={product.id}
                      className="border-gray-700 hover:bg-[#2D1B55]"
                    >
                      <TableCell className="text-white">{index + 1}</TableCell>
                      <TableCell className="font-medium text-white flex items-center gap-3">
                        {product.logoImage ? (
                          <div className="relative h-12 w-12 rounded-md overflow-hidden">
                            <Image
                              src={product.logoImage}
                              alt={product.title}
                              fill
                              className="object-contain"
                              style={{ objectPosition: "center" }}
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-[#2D1B55] flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="w-[200px] flex flex-wrap">
                          <p className="font-medium flex-wrap truncate">
                            {product.title}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1  truncate">
                            {product.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="w-[230px]">
                          {product.features?.length > 0 && (
                            <ul className="flex flex-col gap-2">
                              <li className="text-xs bg-[#2D1B55] px-2 py-1 rounded truncate">
                                {product.features[0]}
                              </li>
                            </ul>
                          )}
                          {product.images?.length > 0 && (
                            <div className="text-xs text-gray-400">
                              {product.images.length} images
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            ₹{product.price.toFixed(2)}
                          </span>
                          {product.discount > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400 line-through">
                                ${product.originalPrice.toFixed(2)}
                              </span>
                              <span className="text-xs text-emerald-400">
                                ({product.discount}% off)
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <Badge
                          variant={
                            product.stock > 0 ? "default" : "destructive"
                          }
                          className="w-fit"
                        >
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        <Badge
                          variant="outline"
                          className="text-[#C27AFF] border-[#C27AFF]"
                        >
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        <Badge
                          variant="outline"
                          className="text-[#C27AFF] border-[#C27AFF]"
                        >
                          {product.group}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-[#C27AFF] hover:text-[#A55CE6] hover:bg-[#2D1B55]"
                          onClick={() => {
                            setEditDialgBox((prev) => !prev);
                            setEditProduct(product);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-400 hover:bg-[#2D1B55]"
                          onClick={() => setDeleteProductId(product.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-gray-400"
                    >
                      No products found. Add your first product!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <AddProductForm
          setIsProductAdded={setIsProductAdded}
          isProductAdded={isProductAdded}
          setUiUpdate={setUiUpdate}
        />
      )}

      {editProduct && (
        <EditProductDialog
          product={editProduct}
          onSuccess={() => setUiUpdate((prev) => !prev)}
          setEditDialgBox={setEditDialgBox}
          editDialgBox={editDialgBox}
        />
      )}
    </main>
  );
};

export default Products;
