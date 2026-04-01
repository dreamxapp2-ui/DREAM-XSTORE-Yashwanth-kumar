import { redirect } from "next/navigation";

export default function LoginRedirectPage() {
  redirect("http://localhost:3000/login");
}