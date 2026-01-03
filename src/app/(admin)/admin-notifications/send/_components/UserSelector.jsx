"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, UserPlus } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export function UserSelector({ selectedUsers = [], onChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search for users when query changes
  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchUsers(debouncedSearch);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch]);

  const searchUsers = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (response.ok) {
        // Filter out already selected users
        const filteredResults = data.users.filter(
          (user) => !selectedUsers.some((selected) => selected.id === user.id)
        );
        setSearchResults(filteredResults);
      } else {
        toast.error("Failed to search users");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("An error occurred while searching");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = (user) => {
    const newSelectedUsers = [...selectedUsers, user];
    onChange(newSelectedUsers);
    setSearchQuery("");
    setSearchResults([]);
    toast.success(`${user.name} added`);
  };

  const handleRemoveUser = (userId) => {
    const newSelectedUsers = selectedUsers.filter((user) => user.id !== userId);
    onChange(newSelectedUsers);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-search">Search Users</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="user-search"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <div className="border rounded-md">
            <ScrollArea className="h-[200px]">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                      onClick={() => handleAddUser(user)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddUser(user);
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="space-y-2">
          <Label>
            Selected Users ({selectedUsers.length})
          </Label>
          <ScrollArea className="h-[150px] border rounded-md p-3">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <Badge
                  key={user.id}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="text-sm">{user.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
