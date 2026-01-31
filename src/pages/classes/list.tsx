import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { ShowButton } from "@/components/refine-ui/buttons/show";

import { ClassDetails, Subject, User } from "@/types";

const ClassListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");

  const { data: subjectsData } = useList<Subject>({
    resource: "subjects",
    pagination: { mode: "off" },
  });
  const subjects = subjectsData?.data || [];

  const { data: teachersData } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "role",
        operator: "eq",
        value: "teacher",
      },
    ],
    pagination: { mode: "off" },
  });
  const teachers = teachersData?.data || [];

  const columns = useMemo<ColumnDef<ClassDetails>[]>(
    () => [
      {
        id: "bannerUrl",
        accessorKey: "bannerUrl",
        size: 80,
        header: () => <p className="column-title ml-2">Banner</p>,
        cell: ({ getValue }) => {
          const url = getValue<string>();
          return (
            <div className="ml-2 w-10 h-10 relative">
              <img
                src={url || "/placeholder.png"}
                alt="Banner"
                className="w-full h-full rounded object-cover bg-muted"
              />
            </div>
          );
        },
      },
      {
        id: "name",
        accessorKey: "name",
        size: 200,
        header: () => <p className="column-title">Class Name</p>,
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        size: 100,
        header: () => <p className="column-title">Status</p>,
        cell: ({ getValue }) => {
          const status = getValue<string>();
          return (
            <Badge variant={status === "active" ? "default" : "secondary"}>
              {status}
            </Badge>
          );
        },
      },
      {
        id: "subject",
        accessorKey: "subject",
        size: 150,
        header: () => <p className="column-title">Subject</p>,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<Subject>()?.name}</span>
        ),
      },
      {
        id: "teacher",
        accessorKey: "teacher",
        size: 150,
        header: () => <p className="column-title">Teacher</p>,
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue<User>()?.name}</span>
        ),
      },
      {
        id: "capacity",
        accessorKey: "capacity",
        size: 100,
        header: () => <p className="column-title">Capacity</p>,
        cell: ({ getValue }) => <span>{getValue<number>()}</span>,
      },
      {
        id: "actions",
        size: 100,
        header: () => <p className="column-title">Actions</p>,
        cell: ({ row }) => (
          <ShowButton
            resource="classes"
            recordItemId={row.original.id}
            variant="outline"
            size="sm"
          >
            Details
          </ShowButton>
        ),
      },
    ],
    [],
  );

  const filters = useMemo(() => {
    const activeFilters = [];

    if (searchQuery) {
      activeFilters.push({
        field: "name",
        operator: "contains" as const,
        value: searchQuery,
      });
    }

    if (selectedSubject !== "all") {
      activeFilters.push({
        field: "subject",
        operator: "eq" as const,
        value: selectedSubject,
      });
    }

    if (selectedTeacher !== "all") {
      activeFilters.push({
        field: "teacher",
        operator: "eq" as const,
        value: selectedTeacher,
      });
    }
    return activeFilters;
  }, [searchQuery, selectedSubject, selectedTeacher]);

  const table = useTable<ClassDetails>({
    resource: "classes",
    columns,
    refineCoreProps: {
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      filters: {
        permanent: filters,
      },
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Classes</h1>

      <div className="intro-row">
        <p>Manage your classes, subjects, and teacher assignments.</p>

        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by class name..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CreateButton resource="classes" />
          </div>
        </div>
      </div>

      <DataTable table={table} />
    </ListView>
  );
};

export default ClassListPage;
