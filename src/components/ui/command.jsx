"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

const Command = React.forwardRef(({ className, ...props }, ref) => (
    <CommandPrimitive
        ref={ref}
        className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
            className
        )}
        {...props}
    />
))
Command.displayName = "Command"

const CommandInput = React.forwardRef(({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandPrimitive.Input
            ref={ref}
            className={cn(
                "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    </div>
))
CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef(({ className, ...props }, ref) => (
    <CommandPrimitive.List
        ref={ref}
        className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
        {...props}
    />
))
CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef((props, ref) => (
    <CommandPrimitive.Empty
        ref={ref}
        className="py-6 px-4 text-center text-sm"
        {...props}
    />
))
CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef(({ className, ...props }, ref) => (
    <CommandPrimitive.Group
        ref={ref}
        className={cn(
            "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
            className
        )}
        {...props}
    />
))
CommandGroup.displayName = "CommandGroup"

const CommandSeparator = React.forwardRef(({ className, ...props }, ref) => (
    <CommandPrimitive.Separator
        ref={ref}
        className={cn("bg-border -mx-1 h-px", className)}
        {...props}
    />
))
CommandSeparator.displayName = "CommandSeparator"

const CommandItem = React.forwardRef(({ className, ...props }, ref) => (
    <CommandPrimitive.Item
        ref={ref}
        className={cn(
            "aria-selected:bg-accent aria-selected:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        {...props}
    />
))
CommandItem.displayName = "CommandItem"

const CommandShortcut = ({ className, ...props }) => {
    return (
        <span
            className={cn(
                "text-muted-foreground ml-auto text-xs tracking-widest",
                className
            )}
            {...props}
        />
    )
}
CommandShortcut.displayName = "CommandShortcut"

export {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
} 