// ./app/components/jobs/RoomAutocomplete.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Check, ChevronsUpDown, Search, MapPin } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { usePropertyStore } from '@/app/lib/stores/propertyStore';
import { Room } from '@/app/lib/types';
import { fetchRooms } from '@/app/lib/data';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/app/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';

interface RoomAutocompleteProps {
  selectedRoom: Room | null;
  onRoomSelect: (room: Room) => void;
  propertyId?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const RoomAutocomplete: React.FC<RoomAutocompleteProps> = ({
  selectedRoom,
  onRoomSelect,
  propertyId,
  placeholder = "Select a room...",
  disabled = false,
  className
}) => {
  const { selectedProperty } = usePropertyStore();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Use propertyId prop or fall back to selectedProperty from store
  const effectivePropertyId = propertyId || selectedProperty;

  useEffect(() => {
    const loadRooms = async () => {
      if (!effectivePropertyId) {
        setRooms([]);
        return;
      }

      setLoading(true);
      try {
        const fetchedRooms = await fetchRooms(effectivePropertyId);
        setRooms(fetchedRooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, [effectivePropertyId]);

  const handleRoomSelect = (room: Room) => {
    onRoomSelect(room);
    setOpen(false);
    setSearchValue('');
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const filteredRooms = rooms.filter(room =>
    room.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    String(room.room_id).toLowerCase().includes(searchValue.toLowerCase())
  );

  const getRoomDisplayName = (room: Room) => {
    if (room.name) {
      return `${room.name} (${room.room_id})`;
    }
    return String(room.room_id) || 'Unknown Room';
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {selectedRoom ? (
                <>
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{getRoomDisplayName(selectedRoom)}</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {loading ? 'Loading rooms...' : placeholder}
                  </span>
                </>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search rooms..."
              value={searchValue}
              onValueChange={handleSearchChange}
              ref={inputRef}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading rooms...</span>
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No rooms found.
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredRooms.map((room) => (
                  <CommandItem
                    key={room.room_id}
                    value={String(room.room_id)}
                    onSelect={() => handleRoomSelect(room)}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{room.name || 'Unnamed Room'}</div>
                      <div className="text-xs text-gray-500 truncate">
                        ID: {room.room_id}
                      </div>
                    </div>
                    {selectedRoom?.room_id === room.room_id && (
                      <Check className="h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected room display */}
      {selectedRoom && (
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {selectedRoom.name || selectedRoom.room_id}
          </Badge>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRoomSelect(null as any)}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default RoomAutocomplete;