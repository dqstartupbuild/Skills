import { HomeClient } from "@/app/home-client";
import { getSkillCatalog } from "@/lib/skills";

export default async function Home() {
  const skills = await getSkillCatalog();

  return <HomeClient skills={skills} />;
}
