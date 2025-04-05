import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, Square } from "lucide-react";
import { ReactNode } from "react";

export default function ToggleButton({
    name,
    state,
    onClick,
    className = "",
    tooltip,
}: {
    name: string;
    state: boolean;
    onClick: () => void;
    className?: string;
    tooltip?: ReactNode;
}) {
    const button = (
        <Button 
            variant="ghost"
            onClick={onClick}
            className={cn(className, "flex items-center gap-2")}
        >
            {state ? <Check /> : <Square fill="#fff" />}
            {name}
        </Button>
    );

    if (tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {button}
                    </TooltipTrigger>
                    <TooltipContent>
                        {tooltip}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return button;
}