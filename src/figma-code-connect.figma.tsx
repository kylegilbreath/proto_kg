/**
 * Figma Code Connect — single mapping file for all DuBois components.
 * Maps every Figma component set in KHFOMM4oUyT9XgeeXpbzns to its code counterpart.
 *
 * Icons are in a separate file: src/components/icons/icons.figma.tsx (auto-generated, 445 icons).
 *
 * Publish changes:  npx figma connect publish
 * Delete mappings:  npx figma connect unpublish
 */
import React from "react"
import figma from "@figma/code-connect"

// ─── UI Components ───────────────────────────────────────────────────────────
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"

// ─── Pattern Components ───────────────────────────────────────────────────────
import { SegmentedControl, SegmentedItem } from "@/components/ui/segmented-control"
import { ListItem } from "@/components/ui/list-item"
import { SplitButton } from "@/components/ui/split-button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { RadioTile, RadioTileGroup } from "@/components/ui/radio-tile"
import { SuggestionPill } from "@/components/ui/suggestion-pill"
import { FilterPill } from "@/components/ui/filter-pill"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"

// ─── Shell Components ────────────────────────────────────────────────────────
import { AppShell } from "@/components/shell/AppShell"
import { AppSwitcher } from "@/components/shell/AppSwitcher"
import { FilterBar } from "@/components/shell/FilterBar"
import { GenieCodePanel } from "@/components/shell/GenieCodePanel"
import { NewButton } from "@/components/shell/NewButton"
import { PageHeader } from "@/components/shell/PageHeader"
import { Sidebar } from "@/components/shell/Sidebar"
import { TopBar } from "@/components/shell/TopBar"

// ─── New Components ───────────────────────────────────────────────────────────
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { NotebookCell } from "@/components/ui/notebook-cell"
import { Tree } from "@/components/ui/tree"
import { SidePanel } from "@/components/shell/SidePanel"
import { EditorTabBar } from "@/components/shell/EditorTabBar"

// ─── Additional UI ────────────────────────────────────────────────────────────
import { Progress } from "@/components/ui/progress"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { WorkspacesIcon, SidebarOpenIcon, SidebarClosedIcon, GenieCodeIcon } from "@/components/icons"
import { DbIcon } from "@/components/ui/db-icon"


// ─── Alert ── node 28-2 ─────────────────────────────────────────────────────
figma.connect(
  Alert,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=28-2",
  {
    props: {
      variant: figma.enum("Variant", {
        info:        "info",
        destructive: "destructive",
        warning:     "warning",
        success:     "success",
      }),
      title:       figma.string("Title"),
      description: figma.string("Description"),
    },
    example: ({ variant, title, description }) => (
      <Alert variant={variant}>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    ),
  }
)

// ─── Avatar ── node 404-28 ──────────────────────────────────────────────────
figma.connect(
  Avatar,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=404-28",
  {
    props: {
      size: figma.enum("Size", {
        sm:  "sm",
        md:  "default",
        lg:  "lg",
      }),
    },
    example: ({ size }) => (
      <Avatar size={size}>
        <AvatarImage src="/avatar.jpg" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    ),
  }
)

// ─── Badge ── node 26-2 ─────────────────────────────────────────────────────
figma.connect(
  Badge,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=26-2",
  {
    props: {
      variant: figma.enum("Variant", {
        default:     "default",
        secondary:   "secondary",
        destructive: "destructive",
        default_tag: "default_tag",
        charcoal:    "charcoal",
        coral:       "coral",
        brown:       "brown",
        indigo:      "indigo",
        lemon:       "lemon",
        lime:        "lime",
        pink:        "pink",
        purple:      "purple",
        teal:        "teal",
        turquoise:   "turquoise",
      }),
      children: figma.string("Label"),
      leadingIcon: figma.boolean("Leading Icon", {
        true:  figma.instance("Leading Icon"),
        false: undefined,
      }),
      trailingIcon: figma.boolean("Trailing Icon", {
        true:  figma.instance("Trailing Icon"),
        false: undefined,
      }),
    },
    example: ({ variant, children, leadingIcon, trailingIcon }) => (
      <Badge variant={variant} leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
        {children}
      </Badge>
    ),
  }
)

// ─── Breadcrumb ── node 408-4 ───────────────────────────────────────────────
figma.connect(
  Breadcrumb,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=408-4",
  {
    props: {},
    example: () => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Section</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  }
)

// ─── Button ── node 22-2 ────────────────────────────────────────────────────
figma.connect(
  Button,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=22-2",
  {
    props: {
      variant: figma.enum("Variant", {
        primary:     "primary",
        default:     "default",
        ghost:       "ghost",
        destructive: "destructive",
        link:        "link",
      }),
      size: figma.enum("Size", {
        sm: "sm",
        xs: "xs",
        "icon-sm": "icon-sm",
        "icon-xs": "icon-xs",
      }),
      children: figma.string("Label"),
      icon: figma.boolean("Has Icon", {
        true:  figma.instance("Icon"),
        false: undefined,
      }),
    },
    example: ({ variant, size, children, icon }) => (
      <Button variant={variant} size={size}>
        {icon}
        {children}
      </Button>
    ),
  }
)

// ─── Card ── node 566-22 ────────────────────────────────────────────────────
figma.connect(
  Card,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=566-22",
  {
    props: {
      type: figma.enum("Type", {
        default: "default",
        "header-only": "header-only",
      }),
    },
    example: () => (
      <Card>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content</p>
        </CardContent>
        <CardFooter>
          <p>Card footer</p>
        </CardFooter>
      </Card>
    ),
  }
)

// ─── Checkbox ── node 393-16 ────────────────────────────────────────────────
figma.connect(
  Checkbox,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=393-16",
  {
    props: {
      defaultChecked: figma.enum("State", {
        unchecked:     false,
        checked:       true,
        indeterminate: "indeterminate",
      }),
      disabled: figma.enum("Disabled", {
        true:  true,
        false: undefined,
      }),
    },
    example: ({ defaultChecked, disabled }) => (
      <Checkbox defaultChecked={defaultChecked} disabled={disabled} />
    ),
  }
)

// ─── Dialog ── node 668-52 ──────────────────────────────────────────────────
figma.connect(
  Dialog,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=668-52",
  {
    props: {
      type: figma.enum("Type", {
        default:     "default",
        "no-footer": "no-footer",
      }),
    },
    example: () => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="default">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Supporting description text that explains the purpose of this dialog.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p>Dialog body content goes here.</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="default">Cancel</Button>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  }
)

// ─── DropdownMenu ── node 626-30 ────────────────────────────────────────────
figma.connect(
  DropdownMenu,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=626-30",
  {
    props: {},
    example: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm">Options</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }
)

// ─── Input ── node 30-2 ─────────────────────────────────────────────────────
figma.connect(
  Input,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=30-2",
  {
    props: {
      placeholder: figma.string("Placeholder"),
      disabled: figma.enum("State", {
        default:  false,
        focus:    false,
        error:    false,
        disabled: true,
      }),
      ariaInvalid: figma.enum("State", {
        default:  undefined,
        focus:    undefined,
        error:    true,
        disabled: undefined,
      }),
    },
    example: ({ placeholder, disabled, ariaInvalid }) => (
      <Input
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
      />
    ),
  }
)

// ─── Label ── node 554-7 ────────────────────────────────────────────────────
figma.connect(
  Label,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=554-7",
  {
    props: {
      disabled: figma.enum("State", {
        default:  false,
        disabled: true,
      }),
    },
    example: ({ disabled }) => (
      <Label aria-disabled={disabled}>Label text</Label>
    ),
  }
)

// ─── RadioGroup ── node 387-8 ───────────────────────────────────────────────
figma.connect(
  RadioGroupItem,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=387-8",
  {
    props: {
      checked: figma.enum("Checked", {
        true: true,
        false: false,
      }),
      disabled: figma.enum("Disabled", {
        true: true,
        false: undefined,
      }),
    },
    example: ({ disabled }) => (
      <RadioGroup defaultValue="option-1">
        <RadioGroupItem value="option-1" disabled={disabled} />
        <RadioGroupItem value="option-2" disabled={disabled} />
      </RadioGroup>
    ),
  }
)

// ─── Select ── node 31-2 ────────────────────────────────────────────────────
figma.connect(
  Select,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=31-2",
  {
    props: {
      disabled: figma.enum("State", {
        default:  false,
        open:     false,
        disabled: true,
      }),
    },
    example: ({ disabled }) => (
      <Select disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    ),
  }
)

// ─── Sheet ── node 563-19 ───────────────────────────────────────────────────
figma.connect(
  Sheet,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=563-19",
  {
    props: {
      side: figma.enum("Side", {
        right: "right",
        left:  "left",
      }),
    },
    example: ({ side }) => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default" size="sm">Open</Button>
        </SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description goes here.</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
  }
)

// ─── Switch ── node 389-10 ──────────────────────────────────────────────────
figma.connect(
  Switch,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=389-10",
  {
    props: {
      defaultChecked: figma.enum("On", {
        true:  true,
        false: false,
      }),
      disabled: figma.enum("Disabled", {
        true:  true,
        false: undefined,
      }),
    },
    example: ({ defaultChecked, disabled }) => (
      <Switch defaultChecked={defaultChecked} disabled={disabled} />
    ),
  }
)

// ─── Table ── node 573-66 ───────────────────────────────────────────────────
figma.connect(
  Table,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=573-66",
  {
    props: {
      state: figma.enum("State", {
        default:    "default",
        "row-hover": "row-hover",
      }),
    },
    example: () => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column value</TableHead>
            <TableHead>Secondary data</TableHead>
            <TableHead>Tag / Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Column value</TableCell>
            <TableCell>Secondary data</TableCell>
            <TableCell>Tag / Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  }
)

// ─── Tabs ── node 707-9 ─────────────────────────────────────────────────────
figma.connect(
  Tabs,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=707-9",
  {
    props: {},
    example: () => (
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 content</TabsContent>
        <TabsContent value="tab2">Tab 2 content</TabsContent>
        <TabsContent value="tab3">Tab 3 content</TabsContent>
      </Tabs>
    ),
  }
)

// ─── Tooltip ── node 553-10 ─────────────────────────────────────────────────
figma.connect(
  Tooltip,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=553-10",
  {
    props: {
      side: figma.enum("Side", {
        top:    "top",
        bottom: "bottom",
        left:   "left",
        right:  "right",
      }),
    },
    example: ({ side }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent side={side}>
            Tooltip text
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  }
)

// ─── PageHeader ── node 446-6 ───────────────────────────────────────────────
figma.connect(
  PageHeader,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=446-6",
  {
    props: {},
    example: () => (
      <PageHeader
        title="Page title"
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Parent</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Current page</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        badge={<Badge>Label</Badge>}
        description="Page description text"
        actions={
          <>
            <Button variant="default" size="sm">Secondary action</Button>
            <Button size="sm">Primary action</Button>
          </>
        }
      />
    ),
  }
)

// ─── NavItem ── node 207-32 ─────────────────────────────────────────────────
// Nav items are configured via the nav array in Sidebar.tsx, not as standalone JSX.
// Add an entry to the NAV_SECTIONS array:
//   { id: "my-item", label: "Label", icon: WorkspacesIcon }
// Then pass `activeItem="my-item"` to <AppShell> to show the active state.
figma.connect(
  Sidebar,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=207-32",
  {
    props: {},
    example: () => (
      <Sidebar
        open={true}
        activeItem="my-item"
        onNavigate={() => {}}
        // Add to NAV_SECTIONS in Sidebar.tsx:
        // { id: "my-item", label: "Label", icon: WorkspacesIcon }
      />
    ),
  }
)

// ─── Sidebar ── node 214-89 ─────────────────────────────────────────────────
figma.connect(
  Sidebar,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=214-89",
  {
    props: {},
    example: () => (
      <Sidebar open={true} activeItem="workspace" onNavigate={(id) => {}} />
    ),
  }
)

// ─── TopBar ── node 209-36 ──────────────────────────────────────────────────
figma.connect(
  TopBar,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=209-36",
  {
    props: {
      workspace: figma.string("Workspace"),
      userInitial: figma.string("User Initial"),
    },
    example: ({ workspace, userInitial }) => (
      <TopBar workspace={workspace} userInitial={userInitial} />
    ),
  }
)

// ─── NewButton ── node 798-121 ───────────────────────────────────────────────
figma.connect(
  NewButton,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=798-121",
  {
    props: {},
    example: () => <NewButton />,
  }
)

// ─── AppShell ── node 798-124 ────────────────────────────────────────────────
figma.connect(
  AppShell,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=798-124",
  {
    props: {},
    example: () => (
      <AppShell activeItem="workspace" workspace="Production" userInitial="N">
        <div>{/* page content */}</div>
      </AppShell>
    ),
  }
)

// ─── SegmentedItem ── node 802-14 ────────────────────────────────────────────
figma.connect(
  SegmentedControl,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=802-14",
  {
    props: {
      state: figma.enum("State", {
        Default: "default",
        Active:  "active",
      }),
    },
    example: () => (
      <SegmentedControl value="option1" onValueChange={() => {}}>
        <SegmentedItem value="option1">Option 1</SegmentedItem>
        <SegmentedItem value="option2">Option 2</SegmentedItem>
        <SegmentedItem value="option3">Option 3</SegmentedItem>
      </SegmentedControl>
    ),
  }
)

// ─── AppSwitcher ── node 761-8 ───────────────────────────────────────────────
figma.connect(
  AppSwitcher,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=761-8",
  {
    props: {},
    example: () => <AppSwitcher />,
  }
)

// ─── Progress ── node 390-11 ─────────────────────────────────────────────────
figma.connect(
  Progress,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=390-11",
  {
    props: {
      value: figma.enum("Value", {
        "0%":   0,
        "25%":  25,
        "50%":  50,
        "75%":  75,
        "100%": 100,
      }),
    },
    example: ({ value }) => <Progress value={value} />,
  }
)

// ─── FilterBar ── node 980-35 ────────────────────────────────────────────────
figma.connect(
  FilterBar,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=980-35",
  {
    props: {},
    example: () => (
      <FilterBar
        searchPlaceholder="Filter by name or ID..."
        segments={[
          {
            value: "all",
            onValueChange: () => {},
            items: [
              { value: "all", label: "All" },
              { value: "jobs", label: "Jobs" },
              { value: "pipelines", label: "Pipelines" },
            ],
          },
        ]}
        selects={[
          {
            value: "",
            onValueChange: () => {},
            placeholder: "Tags",
            options: [{ value: "applied", label: "applied" }],
          },
        ]}
        createLabel="Create"
      />
    ),
  }
)

// ─── Pagination ── node 983-24 ───────────────────────────────────────────────
figma.connect(
  Pagination,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=983-24",
  {
    props: {},
    example: () => (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    ),
  }
)

// ─── ListItem ── node 803-10 ─────────────────────────────────────────────────
figma.connect(
  ListItem,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=803-10",
  {
    props: {
      selected: figma.enum("State", {
        Default:  false,
        Selected: true,
      }),
    },
    example: ({ selected }) => (
      <ListItem
        selected={selected}
        icon={<WorkspacesIcon size={14} />}
      >
        Item label
      </ListItem>
    ),
  }
)

// ─── Spinner ── node 1200-171 ────────────────────────────────────────────────
figma.connect(
  Spinner,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1200-171",
  {
    props: {
      size: figma.enum("Size", {
        small:   "small",
        default: "default",
        large:   "large",
      }),
    },
    example: ({ size }) => <Spinner size={size} />,
  }
)

// ─── Empty ── node 1201-25 ───────────────────────────────────────────────────
figma.connect(
  Empty,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1201-25",
  {
    props: {
      title:  figma.boolean("Has Title", {
        true:  "No results found",
        false: undefined,
      }),
      action: figma.boolean("Has Action", {
        true:  <Button size="sm">Get started</Button>,
        false: undefined,
      }),
    },
    example: ({ title, action }) => (
      <Empty
        title={title}
        description="There's nothing here yet."
        action={action}
      />
    ),
  }
)

// ─── NotebookCell ── node 1203-43 ────────────────────────────────────────────
figma.connect(
  NotebookCell,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1203-43",
  {
    props: {
      language: figma.enum("Language", {
        Python:   "Python",
        SQL:      "SQL",
        Markdown: "Markdown",
        Scala:    "Scala",
        R:        "R",
      }),
    },
    example: ({ language }) => <NotebookCell language={language} />,
  }
)

// ─── Tree ── node 1204-33 ────────────────────────────────────────────────────
figma.connect(
  Tree,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1204-33",
  {
    props: {
      variant: figma.enum("Variant", {
        default: "default",
        nav:     "nav",
      }),
    },
    example: ({ variant }) => (
      <Tree
        variant={variant}
        nodes={[
          {
            id: "home",
            label: "Home",
            defaultExpanded: true,
            children: [
              { id: "projects", label: "Spaces" },
              { id: "drafts",   label: "Drafts" },
            ],
          },
        ]}
        selectedId="projects"
        onSelect={() => {}}
      />
    ),
  }
)

// ─── TreeRow ── node 1328-20 ─────────────────────────────────────────────────
// TreeRow is a Figma sub-component; in code, rows are driven by the nodes[] array on <Tree>.
figma.connect(
  Tree,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1328-20",
  {
    props: {
      variant: figma.enum("Variant", {
        default: "default",
        nav:     "nav",
      }),
    },
    example: ({ variant }) => (
      <Tree
        variant={variant}
        nodes={[
          { id: "parent", label: "Parent", defaultExpanded: true, children: [
            { id: "child", label: "Child" },
          ]},
        ]}
        selectedId="child"
        onSelect={() => {}}
      />
    ),
  }
)

// ─── SidePanel ── node 1205-11 ───────────────────────────────────────────────
figma.connect(
  SidePanel,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1205-11",
  {
    props: {},
    example: () => (
      <SidePanel
        path={["...", "Home", "user@example"]}
        nodes={[
          {
            id: "workspace",
            label: "Workspace",
            defaultExpanded: true,
            children: [
              { id: "projects", label: "Spaces" },
            ],
          },
        ]}
        selectedId="projects"
        onSelect={() => {}}
      />
    ),
  }
)

// ─── TabItem ── node 1286-2 ──────────────────────────────────────────────────
// TabItem is a Figma sub-component; in code, tabs are rendered as <TabsTrigger> inside <TabsList>.
figma.connect(
  TabsTrigger,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1286-2",
  {
    props: {},
    example: () => (
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  }
)

// ─── TableCell ── node 1289-5 ────────────────────────────────────────────────
// TableCell is a Figma sub-component; in code, cells live inside <TableRow> inside <TableBody>.
figma.connect(
  TableCell,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1289-5",
  {
    props: {},
    example: () => (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell value</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  }
)

// ─── TableHeaderCell ── node 1289-7 ──────────────────────────────────────────
// TableHeaderCell is a Figma sub-component; in code it maps to <TableHead> inside <TableHeader>.
figma.connect(
  TableHead,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1289-7",
  {
    props: {},
    example: () => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    ),
  }
)

// ─── Tree (rebuilt) ── node 1330-76 ──────────────────────────────────────────
figma.connect(
  Tree,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1330-76",
  {
    props: {
      variant: figma.enum("Variant", {
        default: "default",
        nav:     "nav",
      }),
    },
    example: ({ variant }) => (
      <Tree
        variant={variant}
        nodes={[
          { id: "parent", label: "Parent", defaultExpanded: true, children: [
            { id: "child", label: "Child" },
          ]},
        ]}
        selectedId="child"
        onSelect={() => {}}
      />
    ),
  }
)

// ─── EditorTabBar ── node 1211-25 ────────────────────────────────────────────
figma.connect(
  EditorTabBar,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1211-25",
  {
    props: {},
    example: () => (
      <EditorTabBar
        tabs={[
          { id: "notebook-1", label: "notebook.ipynb", type: "notebook" },
          { id: "query-1",    label: "query.sql",       type: "query" },
        ]}
        activeTabId="notebook-1"
        onTabClick={() => {}}
        onTabClose={() => {}}
      />
    ),
  }
)

// ─── TableRow ── node 33-53 ──────────────────────────────────────────────────
figma.connect(
  TableRow,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=33-53",
  {
    props: {
      selected: figma.enum("State", {
        default:  false,
        hover:    false,
        selected: true,
      }),
    },
    example: ({ selected }) => (
      <TableRow data-selected={selected || undefined}>
        <TableCell>Value</TableCell>
      </TableRow>
    ),
  }
)

// ─── Textarea ── node 1888-23 ────────────────────────────────────────────────
figma.connect(
  Textarea,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1888-23",
  {
    props: {
      disabled: figma.enum("State", {
        default:  false,
        focus:    false,
        error:    false,
        disabled: true,
      }),
      ariaInvalid: figma.enum("State", {
        default:  undefined,
        focus:    undefined,
        error:    true,
        disabled: undefined,
      }),
    },
    example: ({ disabled, ariaInvalid }) => (
      <Textarea
        placeholder="Enter text..."
        disabled={disabled}
        aria-invalid={ariaInvalid}
      />
    ),
  }
)

// ─── SplitButton ── node 1902-87 ─────────────────────────────────────────────
figma.connect(
  SplitButton,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1902-87",
  {
    props: {
      variant: figma.enum("Variant", {
        primary: "primary",
        default: "default",
      }),
    },
    example: ({ variant }) => (
      <SplitButton variant={variant} onClick={() => {}} onMenuClick={() => {}}>
        Action
      </SplitButton>
    ),
  }
)

// ─── FormField/TextInput ── node 1921-113 ────────────────────────────────────
figma.connect(
  FormItem,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1921-113",
  {
    props: {},
    example: () => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Input placeholder="Placeholder" />
        </FormControl>
        <FormDescription>Helper text</FormDescription>
        <FormMessage />
      </FormItem>
    ),
  }
)

// ─── FormField/Select ── node 1929-127 ───────────────────────────────────────
figma.connect(
  FormItem,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1929-127",
  {
    props: {},
    example: () => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
  }
)

// ─── FormField/Checkbox ── node 1946-134 ─────────────────────────────────────
figma.connect(
  FormItem,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1946-134",
  {
    props: {
      defaultChecked: figma.enum("Checked", { true: true, false: false }),
      disabled:       figma.enum("Disabled", { true: true, false: undefined }),
    },
    example: ({ defaultChecked, disabled }) => (
      <FormItem className="flex items-center gap-2">
        <FormControl>
          <Checkbox defaultChecked={defaultChecked} disabled={disabled} />
        </FormControl>
        <FormLabel>Label</FormLabel>
      </FormItem>
    ),
  }
)

// ─── FormField/Switch ── node 1946-155 ───────────────────────────────────────
figma.connect(
  FormItem,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1946-155",
  {
    props: {
      defaultChecked: figma.enum("On",       { true: true, false: false }),
      disabled:       figma.enum("Disabled", { true: true, false: undefined }),
    },
    example: ({ defaultChecked, disabled }) => (
      <FormItem className="flex items-center justify-between">
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Switch defaultChecked={defaultChecked} disabled={disabled} />
        </FormControl>
      </FormItem>
    ),
  }
)

// ─── FormField/RadioTile ── node 1957-305 ────────────────────────────────────
figma.connect(
  RadioTileGroup,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1957-305",
  {
    props: {},
    example: () => (
      <RadioTileGroup value="option1" onValueChange={() => {}}>
        <RadioTile value="option1" label="Option 1" description="Description text" />
        <RadioTile value="option2" label="Option 2" description="Description text" />
      </RadioTileGroup>
    ),
  }
)

// ─── FormField/Slider ── node 1957-248 ───────────────────────────────────────
figma.connect(
  Slider,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1957-248",
  {
    props: {},
    example: () => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Slider defaultValue={[50]} min={0} max={100} />
        </FormControl>
      </FormItem>
    ),
  }
)

// ─── SuggestionPill ── node 1684-14 ──────────────────────────────────────────
figma.connect(
  SuggestionPill,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1684-14",
  {
    props: {
      children: figma.string("Label"),
    },
    example: ({ children }) => (
      <SuggestionPill>{children}</SuggestionPill>
    ),
  }
)

// ─── GenieCodePanel ── node 1686-80 ──────────────────────────────────────────
figma.connect(
  GenieCodePanel,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1686-80",
  {
    props: {},
    example: () => (
      <GenieCodePanel open={true} onClose={() => {}} />
    ),
  }
)

// ─── FilterPill ── node 1643-468 ─────────────────────────────────────────────
figma.connect(
  FilterPill,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1643-468",
  {
    props: {
      active: figma.enum("Active", { true: true, false: false }),
    },
    example: ({ active }) => (
      <FilterPill active={active} onClick={() => {}}>
        Label
      </FilterPill>
    ),
  }
)

// ─── SidebarOpenIcon ── node 1790-653 ────────────────────────────────────────
figma.connect(
  SidebarOpenIcon,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1790-653",
  {
    props: {},
    example: () => <SidebarOpenIcon className="h-4 w-4 text-muted-foreground" />,
  }
)

// ─── SidebarClosedIcon ── node 1790-652 ──────────────────────────────────────
figma.connect(
  SidebarClosedIcon,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1790-652",
  {
    props: {},
    example: () => <SidebarClosedIcon className="h-4 w-4 text-muted-foreground" />,
  }
)

// ─── SidebarPanel ── node 1612-426 ───────────────────────────────────────────
figma.connect(
  SidePanel,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1612-426",
  {
    props: {},
    example: () => (
      <SidePanel
        path={["...", "Home", "user@example"]}
        nodes={[
          {
            id: "workspace",
            label: "Workspace",
            defaultExpanded: true,
            children: [{ id: "projects", label: "Spaces" }],
          },
        ]}
        selectedId="projects"
        onSelect={() => {}}
      />
    ),
  }
)

// ─── GenieCodeIcon ── node 1790-2657 ─────────────────────────────────────────
figma.connect(
  DbIcon,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1790-2657",
  {
    props: {},
    example: () => <DbIcon icon={GenieCodeIcon} color="ai" size={16} />,
  }
)

// ─── FormField/Radio ── node 1936-119 ────────────────────────────────────────
figma.connect(
  FormItem,
  "https://www.figma.com/design/KHFOMM4oUyT9XgeeXpbzns/Untitled?node-id=1936-119",
  {
    props: {},
    example: () => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <RadioGroup defaultValue="option1">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="option1" id="option1" />
              <Label htmlFor="option1">Option 1</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="option2" id="option2" />
              <Label htmlFor="option2">Option 2</Label>
            </div>
          </RadioGroup>
        </FormControl>
        <FormMessage />
      </FormItem>
    ),
  }
)
