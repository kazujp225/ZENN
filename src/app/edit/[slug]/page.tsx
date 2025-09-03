import EditArticleClient from './EditArticleClient'

export default async function EditArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  return <EditArticleClient slug={slug} />
}