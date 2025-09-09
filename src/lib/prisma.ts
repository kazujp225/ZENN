import { PrismaClient } from '@prisma/client'

// PrismaClientのシングルトンインスタンスを作成
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Prismaクライアントのヘルパー関数
export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          articles: true,
          books: true,
          scraps: true,
          followedBy: true,
          following: true,
        }
      }
    }
  })
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      author: true,
      tags: {
        include: {
          tag: true
        }
      },
      comments: {
        include: {
          author: true,
          replies: {
            include: {
              author: true
            }
          }
        },
        where: {
          parentId: null // Only root comments
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          bookmarks: true,
        }
      }
    }
  })
}

export async function getBookBySlug(slug: string) {
  return prisma.book.findUnique({
    where: { slug },
    include: {
      author: true,
      chapters: {
        orderBy: {
          number: 'asc'
        }
      },
      tags: {
        include: {
          tag: true
        }
      },
      _count: {
        select: {
          likes: true,
          purchases: true,
        }
      }
    }
  })
}

export async function getChapterByBookAndSlug(bookSlug: string, chapterSlug: string) {
  const book = await prisma.book.findUnique({
    where: { slug: bookSlug },
    include: {
      chapters: true
    }
  })

  if (!book) return null

  return prisma.chapter.findFirst({
    where: {
      bookId: book.id,
      slug: chapterSlug
    },
    include: {
      book: {
        include: {
          author: true,
          chapters: {
            orderBy: {
              number: 'asc'
            }
          }
        }
      }
    }
  })
}

export async function getTrendingArticles(limit = 20) {
  return prisma.article.findMany({
    where: {
      status: 'PUBLISHED'
    },
    include: {
      author: true,
      tags: {
        include: {
          tag: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      }
    },
    orderBy: [
      { likesCount: 'desc' },
      { viewsCount: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: limit
  })
}

export async function getRecentArticles(limit = 20) {
  return prisma.article.findMany({
    where: {
      status: 'PUBLISHED'
    },
    include: {
      author: true,
      tags: {
        include: {
          tag: true
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      }
    },
    orderBy: {
      publishedAt: 'desc'
    },
    take: limit
  })
}

export async function getPopularTags(limit = 30) {
  return prisma.tag.findMany({
    orderBy: [
      { articlesCount: 'desc' },
      { booksCount: 'desc' }
    ],
    take: limit
  })
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({
    where: { slug },
    include: {
      articles: {
        include: {
          article: {
            include: {
              author: true,
              _count: {
                select: {
                  likes: true,
                  comments: true,
                }
              }
            }
          }
        },
        where: {
          article: {
            status: 'PUBLISHED'
          }
        },
        take: 20
      },
      books: {
        include: {
          book: {
            include: {
              author: true,
              _count: {
                select: {
                  likes: true,
                }
              }
            }
          }
        },
        take: 10
      }
    }
  })
}