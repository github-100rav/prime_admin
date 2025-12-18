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
  deleteGroupId: string | null;
  setDeleteGroupId: React.Dispatch<React.SetStateAction<string | null>>;
  handleDeleteGroup: () => void;
  deleteLoading: boolean;
};
const DeleteModal = ({
  deleteGroupId,
  setDeleteGroupId,
  handleDeleteGroup,
  deleteLoading,
}: DeletePropType) => {
  return (
    <div>
      <Dialog
        open={!!deleteGroupId}
        onOpenChange={(open) => !open && setDeleteGroupId(null)}
      >
        {deleteGroupId && (
          <DialogContent className="bg-[#1F133D] border-[#2D1B55] text-white">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>
                Are you sure you want to delete this group? This action
                cannot be undone.
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
                onClick={handleDeleteGroup}
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

export default DeleteModal;
