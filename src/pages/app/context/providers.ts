
import { ToastProps } from "@/components/ui/toast";

// Export toast type for use in other files
export type ToastType = {
  (props: { 
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
  }): void;
};
