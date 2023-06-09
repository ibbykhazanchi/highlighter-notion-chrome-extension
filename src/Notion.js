import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.REACT_APP_NOTION_KEY });

export const getFolders = async () => {
  try {
    const response = await notion.search({
      filter: {
        value: 'page',
        property: 'object',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time'
      },
    });
    const pageObjects =  response.results.map((pageObj) => {
        return {
          id: pageObj.id,
          title: pageObj.properties.title.title[0].plain_text
        }
    })
    return pageObjects
  } catch(error) {
    console.error(error)
    return null
  }  
}

const createNotionPage = async (title, parentId) => {
  console.log(title)
  
  try {
    const response = await notion.pages.create({
      parent: {
        type: 'page_id',
        page_id: parentId,
      },
      properties: {
        title: {
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: title
              }
            },
          ],
        },
      },
    })
    return response.id
  } catch(error){
    console.error(error)
    return null
  }
}

export const sendSnippetsToNotion = async (snippets, title, id, createPage) => {

  if(!snippets || snippets.length === 0){
      return
  }
  
  // map the snippet array to a list of blocks
  const blocks = mapSnippetsToBlocks(snippets)

  // variable that will hold the parent page
  let parentPageId = id

  // if user wants to create a page, do that
  if(createPage){
    const newPageId = await createNotionPage(title, id)
    parentPageId = newPageId
  }

  // send to notion
  const response = await notion.blocks.children.append({
      block_id: parentPageId,
      children: blocks
  })

  if(response.object.error){
    console.error(response.object.error)
    return false
  } else {
    return true
  }
}

const mapSnippetsToBlocks = snippets => {
  const blocks = snippets.map(snippet => {
      return {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: snippet,
                },
              },
            ],
          },
      }
  })
  return blocks
}
