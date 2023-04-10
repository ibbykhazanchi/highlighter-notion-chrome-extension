import { useEffect, useState } from 'react'
import { sendSnippetsToNotion } from '../Notion';
import { TitleForm } from '../components';
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton'
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear } from '@fortawesome/free-solid-svg-icons'

const StyledDropDownDiv = styled.div`
  position: absolute;
  top: 12px;
  right: 16px;
`
const Toggle = styled(Dropdown.Toggle)`
    :after {
        display: none;
    }
`;
const Main = () => {

  const [url, setUrl] = useState("")
  const [snippets, setSnippets] = useState([])
  const [title, setTitle] = useState('')


  // gets the URL & gets the title
  useEffect(() => {
    const queryInfo = {active: true, lastFocusedWindow: true}

    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
      setUrl(tabs[0].url)
    })

    chrome.storage.local.get('notionPageTitle', (data) => {
      if(data.notionPageTitle){
        setTitle(data.notionPageTitle)
      }
    })
  }, [])

  // when the URL changes, you need to reload snippets and title
  // getting preloaded data
  useEffect(() => {
    chrome.storage.local.get(url, (data) => {
      setSnippets(data[url])

      //try to get the saved title
      chrome.storage.local.get(`${url}:notionPageTitle`, (data) => {
        if(data[`${url}:notionPageTitle`]) {
          setTitle(data[`${url}:notionPageTitle`])
        } else {
          setTitle('')
        }
      })
    })
  }, [url])

  const formOnEnter = (event) => {
    if (event.keyCode === 13) { // Check for Enter key press
      event.preventDefault();

      const titleForm = document.getElementById("title-form")
      const inputTitle = titleForm.value
      titleForm.blur(); // Remove focus from input

      setTitle(inputTitle)

      // now cache it
      const key = `${url}:notionPageTitle`
      chrome.storage.local.set({ [ key ]: inputTitle})
    }
  };

  const handleChange = (event) => {
    setTitle(event.target.value)
  }

  const sendToNotionHandler = () => {
    if(sendSnippetsToNotion(snippets, title)){
      //clear snippets
      setSnippets([])
      setTitle('')

      // delete cached itemes
      chrome.storage.local.remove(url)  
      chrome.storage.local.remove(`${url}:notionPageTitle`)
    }
  }

  return (
    <>
      <StyledDropDownDiv>
        <DropdownButton 
        id="dropdown-basic-button" autoClose={'outside'} drop='down' size='sm'
        title= {<FontAwesomeIcon icon={faGear} />}
        >
              <Dropdown.Item href="#/action-3"> 
              Root Notion Folder 
              <form>
                <input
                  type='text'
                >
                </input>
              </form>
              </Dropdown.Item>
        </DropdownButton> 
      </StyledDropDownDiv>

      
      <TitleForm 

        inputValue={title} 
        handleInputKeyDown = {formOnEnter}
        handleChange = { handleChange }
 
      />

      <Button onClick={ 
        () => sendToNotionHandler() 
      }> Send to Notion! </Button>
  
      {snippets && snippets.length > 0 && (
        <ul>
          {snippets.map(snippet => (
            <li> { snippet } </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Main;
