import { BookIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface ProjectDocCardProps {
  name: string;
  description: string;
  documentationLink: string;
  repositoryLink: string;
}

export default function ProjectDocCard({
  name,
  description,
  documentationLink,
  repositoryLink,
}: ProjectDocCardProps) {
  return (
    <Card className="min-w-72">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="gap-2">
        <Link href={documentationLink}>
          <Button variant={"secondary"}>Documentation</Button>
        </Link>
        <Link href={repositoryLink} rel="noopener noreferrer" target="_blank">
          <Button size={"icon"} variant={"ghost"}>
            <BookIcon />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
