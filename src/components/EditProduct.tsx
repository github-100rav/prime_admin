"use client";
import { useState, useEffect, memo, Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, X, RefreshCcw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getGroup } from "@/app/actions/group.action";
import toast from "react-hot-toast";
import { updateProduct } from "@/app/actions/product.actions";
import { getCategory } from "@/app/actions/category.actions";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  logoImage: string;
  category: string;
  stock: number;
  features: string[];
  images: string[];
  group: string;
}

interface EditProductDialogProps {
  product: Product;
  onSuccess: () => void;
  setEditDialgBox: Dispatch<SetStateAction<boolean>>;
  editDialgBox: boolean;
}

function EditProductDialog({
  setEditDialgBox,
  product,
  onSuccess,
  editDialgBox,
}: EditProductDialogProps) {
  const [formData, setFormData] = useState<any>();
  const [logoImage, setLogoImage] = useState<File | null | string>(null);
  const [images, setImages] = useState<
    FileList | null | string[] | File[] | File
  >(null);
  const [logoPreview, setLogoPreview] = useState(product.logoImage);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product.images);
  const [categories, setCategories] = useState<
    { _id: string; title: string }[]
  >([]);
  const [group, setGroup] = useState<{ _id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const fetchGroup = async () => {
    try {
      setGroupLoading(true);
      const res = await getGroup();
  
      if (res.success) {
      
        setGroup(JSON.parse(res.groups!));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setGroupLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);
      const res = await getCategory();
      if (res.success) {
        setCategories(JSON.parse(res.categories!));
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setCategoryLoading(false);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    field: "logoImage" | "images",
    files: FileList | null
  ) => {
    if (!files) return;
    if (field === "logoImage") {
      setLogoImage(files[0]);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(files[0]);
    } else {
      setImages(files);
      const newPreviews: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const form = new FormData();
      form.append("_id", product.id);
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("category", formData.category);
      form.append("price", formData.price);
      form.append("originalPrice", formData.originalPrice);
      form.append("stock", formData.stock);
      form.append("features", formData.features);
      form.append("group", formData.group);
      if (logoImage) {
        form.append("logoImage", logoImage);
      }
      const imageData = {
        old: imagePreviews.filter((img) =>
          img.startsWith("https://res.cloudinary.com")
        ),
        new: images,
      };

    
      const res = await updateProduct(form, imageData);
      if (res?.success) {
        toast.success(res.message || "Product updated successfully");
        setEditDialgBox(false);
        onSuccess();
      } else {
        setError(res?.message || "Failed to update product");
        toast.error(res?.message || "Failed to update product");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchGroup();
  }, []);

  useEffect(() => {
    if(product){
      setFormData(product);
      setImagePreviews(product.images);
      setLogoPreview(product.logoImage)
    }
  

  }, [product]);

  if (!formData) {
    return <h1>Loading...</h1>;
  }
  
  return (
    <Dialog open={editDialgBox} onOpenChange={setEditDialgBox}>
      <DialogContent className="sm:max-w-4xl bg-[#0C1B44] border-[#C27AFF] h-[80vh] overflow-y-auto text-white z-[110]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#C27AFF]">
            Edit Product
          </DialogTitle>
        </DialogHeader>
        <Separator className="bg-[#C27AFF]" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert
              variant="default"
              className="border-green-400 bg-green-100 text-green-900"
            >
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </div>
            </Alert>
          )}

          {error && (
            <Alert
              variant="destructive"
              className="border-red-400 bg-red-100 text-red-900"
            >
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <AlertTitle className="text-red-800">Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#E2E8F0]">Title *</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-[#1E293B] border-[#C27AFF] text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#E2E8F0]">Category *</Label>
                <Select
                  value={formData?.category}
                  onValueChange={(value) =>
                    setFormData((prev: any) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="bg-[#1E293B] border-[#C27AFF] text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  {categoryLoading?"loading..." : (
                    <SelectContent className="bg-[#1E293B] border-[#C27AFF]  z-[999] cursor-pointer">
                      {categories &&
                        categories.map((category) => (
                          <SelectItem key={category._id} value={category.title}>
                            {category.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  )}
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#E2E8F0]">Group *</Label>
                <Select
                value={formData?.group}
                  onValueChange={(value) =>
                    setFormData((prev: any) => ({ ...prev, group: value }))
                  }
                >
                  <SelectTrigger className="bg-[#1E293B] border-[#C27AFF] text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                {
                <SelectContent className="bg-[#1E293B] border-[#C27AFF] z-[999] cursor-pointer">
                {groupLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  group?.map((g) => (
                    <SelectItem key={g._id} value={g?.title}>
                      {g?.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
              
                }

                  
                </Select>

     
              </div>

              <div className="space-y-2">
                <Label className="text-[#E2E8F0]">Description *</Label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="bg-[#1E293B] border-[#C27AFF] text-white min-h-[120px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#E2E8F0]">Features</Label>
                <Textarea
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  className="bg-[#1E293B] border-[#C27AFF] text-white min-h-[100px]"
                  placeholder="Enter each feature on a new line"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#E2E8F0]">Stock *</Label>
                  <Input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="bg-[#1E293B] border-[#C27AFF] text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#E2E8F0]">Price (₹) *</Label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="bg-[#1E293B] border-[#C27AFF] text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#E2E8F0]">Original Price (₹)</Label>
                  <Input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="bg-[#1E293B] border-[#C27AFF] text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#E2E8F0]">Logo Image</Label>
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

                <div className="space-y-2">
                  <Label className="text-[#E2E8F0]">Product Images</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange("images", e.target.files)}
                    className="bg-[#1E293B] h-10 border-[#C27AFF] text-white file:bg-[#7C3AED] file:text-white file:border-0 file:rounded-md file:px-4 file:py-1"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="h-12 w-12 rounded-lg object-cover border border-[#C27AFF]"
                        />
                        {preview.startsWith("https://res.cloudinary.com") && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialgBox(false)}
              className="text-[#E2E8F0] border-[#C27AFF] hover:bg-[#C27AFF]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default memo(EditProductDialog);
