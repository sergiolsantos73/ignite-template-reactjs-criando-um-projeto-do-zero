import Prismic from '@prismicio/client'

const endpoint = 'https://criando-projeto-zero.prismic.io/api/v2'

export function getPrismicClient(req?: unknown) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const prismic = Prismic.client(
    endpoint, 
    {
      req,
      accessToken: process.env.PRIMIC_ACCESS_TOKEN,
    }
  )
  return prismic;
}
