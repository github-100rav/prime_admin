import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
type DeletePropType = {
  deleteCategoryId: string | null;
  setDeleteCategoryId: React.Dispatch<React.SetStateAction<string | null>>;
  handleDeleteCategory: () => void;
  deleteLoading: boolean;
};

const DeleteModalForCategory = ({
  deleteCategoryId,
  setDeleteCategoryId,
  handleDeleteCategory,
  deleteLoading,
}: DeletePropType) => {
  return (
    <div>
      <Dialog
        open={!!deleteCategoryId}
        onOpenChange={(open) => !open && setDeleteCategoryId(null)}
      >
        {deleteCategoryId && (
          <DialogContent className="bg-[#1F133D] border-[#2D1B55] text-white">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete this group? This action cannot
                be undone.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-gray-600">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleDeleteCategory}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteLoading ? "deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default DeleteModalForCategory;
