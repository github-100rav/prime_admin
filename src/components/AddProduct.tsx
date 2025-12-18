import { useState, useCallback, ChangeEvent, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { CheckCircle, XCircle, X, RefreshCcw } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { addProduct } from "@/app/actions/product.actions";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { getGroup } from "@/app/actions/group.action";
import { getCategory } from "@/app/actions/category.actions";
interface ProductFormData {
  title: string;
  stock: string;
  description: string;
  category: string;
  group: string;
  price: string;
  originalPrice: string;
  logoImage: FileList | null;
  features: string;
  images: FileList | null;
}

interface ProductFormProps {
  setIsProductAdded: (value: boolean) => void;
  isProductAdded: boolean;
  setUiUpdate: any;
}

const initialFormData: ProductFormData = {
  title: "",
  category: "",
  group: "",
  stock: "",
  description: "",
  price: "",
  originalPrice: "",
  logoImage: null,
  features: "",
  images: null,
};
interface Category {
  id: string;
  name: string;
  slug: string;
}
 function AddProductForm({
  isProductAdded,
  setIsProductAdded,
  setUiUpdate,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [groups, setGroups] = useState<any>();
  const [categories, setcategories] = useState<Category[]>([]);
  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;
      setTouchedFields((prev) => new Set(prev.add(name)));
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleFileChange = useCallback(
    (field: "logoImage" | "images", files: FileList | null) => {
      if (!files) return;

      setFormData((prev) => ({ ...prev, [field]: files }));

      if (field === "logoImage") {
        const reader = new FileReader();
        reader.onload = (e) =>
          e.target?.result && setLogoPreview(e.target.result as string);
        reader.readAsDataURL(files[0]);
      } else {
        Promise.all(
          Array.from(files).map(
            (file) =>
              new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
              })
          )
        ).then((previews) => setImagePreviews(previews));
      }
    },
    []
  );

  const validateForm = () => {
    return (
      formData.title.trim() !== "" &&
      formData.description.trim() !== "" &&
      formData.price.trim() !== ""
    );
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setLogoPreview("");
    setImagePreviews([]);
    setTouchedFields(new Set());
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
    
      if (!validateForm()) return;
        setLoading(true);

      try {
    
        
        const res = await addProduct(formData);
        if (res.success) {
          setUiUpdate((prev: any) => !prev);
          setMessage(res.message || "Product Added Successfully");
          resetForm();
          setError("");
          setLoading(false);
          setTimeout(() => {
            setIsProductAdded(!isProductAdded);
            setMessage("");
          }, 1000);
        } else {
          setError(res.message || "Error in adding the product");
          setMessage("");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error adding product:", error);
        setError("Server error. Please try again later.");
        setLoading(false);
      }
    },
    [
      formData,
      isProductAdded,
      setIsProductAdded,
      resetForm,
      setMessage,
      setError,
    ]
  );
  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };
  const getFieldError = (fieldName: keyof ProductFormData) => {
    if (!touchedFields.has(fieldName)) return "";

    const value = formData[fieldName];

    if (typeof value === "string" && !value.trim()) {
      return "This field is required";
    }

    if (fieldName === "price" || fieldName === "originalPrice") {
      if (!value || isNaN(Number(value))) return "Please enter a valid number";
    }

    if ((fieldName === "logoImage" || fieldName === "images") && !value) {
      return "Please upload an image";
    }

    return "";
  };
  const handleCancel = () => {
    setIsProductAdded(!isProductAdded);
  };

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
  }, []);



  useEffect(() => {
    (async function () {
      try {
        setLoading(true);
        const res = await getCategory();
        if (res.success) {
          setcategories(JSON.parse(res.categories!));
         
        }


      } catch (error) {
        console.log(error);
      }finally{
        setLoading(false);
      }
    })();
  }, []);


  return (
    <div className="flex w-full justify-center items-center mx-auto min-h-screen p-4 sm:p-6 lg:p-8 ">
      <Card className="bg-[#0C1B44] w-full max-w-[95%] sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl border border-[#C27AFF] rounded-xl shadow-xl">
        <CardHeader className="pb-0 px-4 sm:px-6">
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#C27AFF] text-center">
            Add New Product
          </CardTitle>
          <CardDescription className="text-center text-[#94A3B8]">
            Fill in the details below to add a new product to your inventory
          </CardDescription>
        </CardHeader>

        <Separator className="bg-[#C27AFF] mb-4 sm:mb-6" />

        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
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
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 lg:space-y-8 w-full"
          >
            <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[#E2E8F0] text-sm font-medium">
                      Product Information
                    </Label>
                    <p className="text-[#94A3B8] text-xs">
                      Basic details about your product
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[#E2E8F0] text-sm font-medium">
                        Title *
                      </Label>
                      <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="bg-[#1E293B] border-[#C27AFF] text-white focus:border-[#7C3AED] focus:ring-[#7C3AED]"
                        required
                      />
                      {getFieldError("title") && (
                        <p className="text-red-400 text-xs">
                          {getFieldError("title")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#E2E8F0] text-sm font-medium">
                        Category *
                      </Label>
                      {
                        loading? "loading...": <Select
                        value={formData.category}
                        onValueChange={(value) => {
                          setTouchedFields(
                            (prev) => new Set(prev.add("category"))
                          );
                          setFormData((prev) => ({ ...prev, category: value }));
                        }}
                      >
                        <SelectTrigger className="bg-[#1E293B] border-[#C27AFF] text-white focus:border-[#7C3AED] focus:ring-[#7C3AED]">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E293B] border-[#C27AFF] text-white">
                          {categories &&
                            categories.map((c: any) => (
                              <SelectItem value={c.title} key={c._id}>
                                {c.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      }
                     
                      {getFieldError("category") && (
                        <p className="text-red-400 text-xs">
                          {getFieldError("category")}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#E2E8F0] text-sm font-medium">
                        Group *
                      </Label>
                      {
                        loading?"loading...":groups && <Select
                        value={formData.group}
                        onValueChange={(value) => {
                          setTouchedFields(
                            (prev) => new Set(prev.add("group"))
                          );
                          setFormData((prev) => ({ ...prev, group: value }));
                        }}
                      >
                        <SelectTrigger className="bg-[#1E293B] border-[#C27AFF] text-white focus:border-[#7C3AED] focus:ring-[#7C3AED]">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E293B] border-[#C27AFF] ">
                          {groups &&
                            groups.map((c: any) => (
                              <SelectItem value={c.title} key={c._id}>
                                {c.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      }
                     
                      {getFieldError("category") && (
                        <p className="text-red-400 text-xs">
                          {getFieldError("category")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#E2E8F0] text-sm font-medium">
                        Description *
                      </Label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="bg-[#1E293B] border-[#C27AFF] text-white h-32 focus:border-[#7C3AED] focus:ring-[#7C3AED]"
                        required
                      />
                      {getFieldError("description") && (
                        <p className="text-red-400 text-xs">
                          {getFieldError("description")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#E2E8F0] text-sm font-medium">
                        Features
                      </Label>
                      <Textarea
                        name="features"
                        value={formData.features}
                        onChange={handleChange}
                        className="bg-[#1E293B] border-[#C27AFF] text-white h-24 focus:border-[#7C3AED] focus:ring-[#7C3AED]"
                        placeholder="Enter each feature on a new line"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[#E2E8F0] text-sm font-medium">
                      Pricing
                    </Label>
                    <p className="text-[#94A3B8] text-xs">
                      Set your product pricing strategy
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[#E2E8F0] text-sm font-medium">
                          Stock *
                        </Label>
                        <Input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          className="bg-[#1E293B] border-[#C27AFF] text-white focus:border-[#7C3AED] focus:ring-[#7C3AED]"
                          required
                        />
                        {getFieldError("stock") && (
                          <p className="text-red-400 text-xs">
                            {getFieldError("stock")}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[#E2E8F0] text-sm font-medium">
                          Price (₹) *
                        </Label>
                        <Input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="bg-[#1E293B] border-[#C27AFF] text-white focus:border-[#7C3AED] focus:ring-[#7C3AED]"
                          required
                        />
                        {getFieldError("price") && (
                          <p className="text-red-400 text-xs">
                            {getFieldError("price")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#E2E8F0] text-sm font-medium">
                          Original Price (₹)
                        </Label>
                        <Input
                          type="number"
                          name="originalPrice"
                          value={formData.originalPrice}
                          onChange={handleChange}
                          className="bg-[#1E293B] border-[#C27AFF] text-white focus:border-[#7C3AED] focus:ring-[#7C3AED]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[#E2E8F0] text-sm font-medium">
                      Media
                    </Label>
                    <p className="text-[#94A3B8] text-xs">
                      Upload product images and logo
                    </p>
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

                    <div className="space-y-2">
                      <Label className="text-[#E2E8F0] text-sm font-medium">
                        Product Images
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          handleFileChange("images", e.target.files)
                        }
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
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CardFooter className="flex justify-end px-0 pb-0 gap-3">
              <Button
                onClick={handleCancel}
                type="button"
                variant="outline"
                className="text-[#E2E8F0] border-[#C27AFF] hover:bg-[#C27AFF]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
export default memo(AddProductForm)
