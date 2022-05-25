import { useState } from 'react'
import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';
import Link from 'next/link'
import Head from 'next/head'
import Prismic from '@prismicio/client'
import ptBR from 'date-fns/locale/pt-BR'
import { FiCalendar, FiUser } from 'react-icons/fi'
import { format } from 'date-fns'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  }
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)

  async function getMorePosts() {
    await fetch(postsPagination.next_page)
      .then(data => data.json())
      .then(response => {
        const postsResponse = response.results.map(post => {
          return {
            uid: post.uid,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
            first_publication_date: post.first_publication_date
          }
        })
        setPosts([...postsResponse, ...posts])
      })
  }

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>

      <main className={styles.container}>
        <img className={styles.logo} src="/images/Logo.svg" alt="logo" />
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.infoContainer}>
                  <div>
                    <FiCalendar />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </time>
                  </div>
                  <div>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {postsPagination.next_page && (
          <button
            onClick={getMorePosts}
            type="button"
            className={styles.button}
          >
            Carregar posts
          </button>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.content'],
      pageSize: 20,
    }
  )

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      }
    },
    revalidate: 60 * 60 * 24
  }
}

