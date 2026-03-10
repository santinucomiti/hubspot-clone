'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback(
    (value: string) => {
      setOpen(false);
      router.push(value);
    },
    [router],
  );

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md bg-muted/50 px-3 text-sm text-muted-foreground sm:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>Rechercher...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher contacts, entreprises, affaires..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandGroup heading="Navigation rapide">
            <CommandItem onSelect={() => handleSelect('/')}>
              Tableau de bord
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/contacts')}>
              Contacts
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/companies')}>
              Entreprises
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/deals')}>
              Affaires
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/marketing')}>
              Marketing
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/tickets')}>
              Tickets
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
