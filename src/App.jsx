import {useState} from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    TypingIndicator
} from '@chatscope/chat-ui-kit-react';

const API_KEY = process.env.OPENAI_API_KEY;

function App() {
    const [messages, setMessages] = useState([
        {
            message: "Hi, I'm SaatvaAssistant, your personal shopping assistant! 🤩 Ask me anything!",
            sentTime: "just now",
            sender: "ChatGPT"
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    function systemMessage(documentText) {
        return {
            "role": "system",
            "content": "You are a chatbot for Saatva.com, an online mattress retailer, be professional in answering customer questions and concise, be friendly. add emojis when needed. " +
                "dont include links and view product details in the response. if the customer is very angry or upset" +
                " give them the following discount code HAPPYSAATVA for 5% off. if the customer request to speak to a real person, " +
                "provide the following information : info@saatvamattress.com (877) 354-2728 " +
                "You are given the following context extracted from the website, answer only according to this information:"
                + documentText
        }
    }


    const handleSend = async (message) => {
        const newMessage = {
            message,
            direction: 'outgoing',
            sender: "user"
        };

        const newMessages = [...messages, newMessage];

        setMessages(newMessages);

        // Initial system message to determine ChatGPT functionality
        // How it responds, how it talks, etc.
        setIsTyping(true);
        await processMessageToChatGPT(newMessages);
    };

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function fetchTextFromPage() {
        const element = document.querySelector('.main');
        return element ? element.innerText : null;
    }

    function addNewMessage(chatMessages, msg) {
        setIsTyping(false);
        setMessages([...chatMessages, {
            message: msg,
            sender: "ChatGPT"
        }]);
    }

    async function clickCart() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab) {
                    chrome.scripting.executeScript({
                        target: {tabId: activeTab.id},
                        function: clickCartHelper
                    }, () => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }

                        resolve(true);
                    });
                } else {
                    reject(new Error('No active tab found'));
                }
            });
        });


        function clickCartHelper() {
            const buttons = document.querySelectorAll('button');

            let targetButton = null;

            const regex = /^Add \d+ Item to Cart$/;
            console.log("in click cart")
            for (let button of buttons) {
                console.log("inn")
                console.log(button.innerText);
                if (regex.test(button.innerText)) {
                    targetButton = button;
                    break;
                }
            }


            if (targetButton) {
                targetButton.click();
            } else {
                console.error("could not click cart")
            }
        }
    }

    const retrieveText = () => {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab) {
                    chrome.scripting.executeScript({
                        target: {tabId: activeTab.id},
                        function: fetchTextFromPage
                    }, (results) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }
                        const [result] = results;
                        const extractedText = cleanText(result.result);
                        resolve(extractedText);
                    });
                } else {
                    reject(new Error('No active tab found'));
                }
            });
        });
    }

    async function identifyScroll(){
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab) {
                    chrome.scripting.executeScript({
                        target: {tabId: activeTab.id},
                        function: identifyScrollHelper
                    }, (results) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }
                        const [result] = results;
                        console.log("identified scroll")
                        console.log(results)
                        console.log(result.result)
                        resolve(result.result);
                        resolve(true);
                    });
                } else {
                    reject(new Error('No active tab found'));
                }
            });
        });


        function identifyScrollHelper() {
            return Array.from(document.querySelectorAll('section'))
                .map(section => section.id)
                .filter(selector => selector); // This will remove any sections that don't have an id or class.
        }


    }

    async function scrollTo(tag){
        console.log("inside scroll to")
        console.log(tag)
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab) {
                    console.log("active tab scroll 2")
                    chrome.scripting.executeScript({
                        target: {tabId: activeTab.id},
                        func: scroll2tag,
                        args: [tag]
                    }, (r) => {
                        console.log("active tab scroll 22222")
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }

                        resolve(true);
                    });
                } else {
                    reject(new Error('No active tab found'));
                }
            });
        });

        function scroll2tag(tag) {
            console.log("inside scroll 222 tag")
            console.log(tag)
            window.location.hash = tag
        }
    }

        async function identifyNav(){
            return new Promise((resolve, reject) => {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    const activeTab = tabs[0];
                    if (activeTab) {
                        chrome.scripting.executeScript({
                            target: {tabId: activeTab.id},
                            function: identifyNavHelper
                        }, (results) => {
                            if (chrome.runtime.lastError) {
                                reject(chrome.runtime.lastError);
                                return;
                            }
                            const [result] = results;
                            console.log("identified nav")
                            console.log(results)
                            console.log(result.result)
                            resolve(result.result);
                            resolve(true);
                        });
                    } else {
                        reject(new Error('No active tab found'));
                    }
                });
            });


            function identifyNavHelper() {
                const links = document.querySelectorAll('a[href]');
                const hrefs =  Array.from(links).map(link => link.href);


                function filterAndDeduplicate(array) {
                    let uniqueSet = new Set(array); // Removes duplicates
                    let uniqueArray = Array.from(uniqueSet); // Convert Set back to Array
                    return uniqueArray.filter(item => item.startsWith('https://www.saatva.com'));
                }

                return filterAndDeduplicate(hrefs);
            }
        }



    async function navTo(url){
        console.log("inside nav to")
        console.log(url)
        return new Promise((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                const activeTab = tabs[0];
                if (activeTab) {
                    console.log("active tab nav 2")
                    chrome.scripting.executeScript({
                        target: {tabId: activeTab.id},
                        func: nav2url,
                        args: [url]
                    }, (r) => {
                        console.log("active tab nav 22222")
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                            return;
                        }

                        resolve(true);
                    });
                } else {
                    reject(new Error('No active tab found'));
                }
            });
        });


        function nav2url(url) {
            console.log("inside nav 222 tag")
            console.log(url)
            window.location.href = url
        }
    }



    async function processMessageToChatGPT(chatMessages) {

        let apiMessages = chatMessages.map((messageObject) => {
            let role = "";
            if (messageObject.sender === "ChatGPT") {
                role = "assistant";
            } else {
                role = "user";
            }
            return {role: role, content: messageObject.message}
        });

        // Only send the initial context and the last message the user sent for now
        // Because we are limiting to 4k context tokens
        apiMessages = [apiMessages[0], apiMessages[apiMessages.length-1]];
        const lastMessage = apiMessages[apiMessages.length-1].content;
        console.log("what is the message");
        console.log(lastMessage);
        if (lastMessage.toLowerCase().includes("add") && lastMessage.toLowerCase().includes("cart")) {
            console.log("in add to cart")
            await clickCart();
            await sleep(1500)
            addNewMessage(chatMessages, "SaatvaAssistant has added the current item to the cart!");
            // setIsTyping(false);
            // setMessages([...chatMessages, {
            //     message: ,
            //     sender: "ChatGPT"
            // }]);
            return;
        }

        if (lastMessage.toLowerCase().includes("scroll")) {
            console.log("scroll")
            const identifyScrollDestination = await identifyScroll();
            apiMessages = [apiMessages[apiMessages.length-1]];
            let apiRequestBody;
            const scrollSystemMessage = {
                "role": "system",
                "content": "You are a chatbot assistant for an online mattress retailer. " +
                    "You are helping the user scroll to a part in the website. " +
                    "From the following array, identify the website tag that most" +
                    " closely resembles what the user is trying to scroll to" +
                    " return just that exact tag, if nothing is close return NOID "
                    +JSON.stringify(identifyScrollDestination)
            }



            apiRequestBody = {
                "model": "gpt-3.5-turbo", "messages": [
                    scrollSystemMessage,  // The system message DEFINES the logic of our chatGPT
                    ...apiMessages // The messages from our chat with ChatGPT
                ]
            };

            console.log("scroll api request")
            console.log(apiRequestBody);

            await fetch("https://api.openai.com/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + API_KEY,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(apiRequestBody)
                }).then((data) => {
                return data.json();
            }).then( async (data) => {
                console.log("return from scroll gpt")
                console.log(data);
                console.log(data.choices[0].message.content);
                const tag = data.choices[0].message.content;
                if (tag == "NOID") {
                    addNewMessage(chatMessages, "SaatvaAssistant was not able to identify the section you wanted to scroll to. Please try again!");
                } else {
                    await scrollTo(tag);
                }

                addNewMessage(chatMessages, "SaatvaAssistant has scrolled to that section!");
                return;


                // addNewMessage(chatMessages, );
            }).catch((error)=>{
                console.error(error);
                addNewMessage(chatMessages, "SaatvaAssistant has encountered an error. Please try again!");
            });

            return




        }

        if (lastMessage.toLowerCase().includes("navigate")) {
            console.log("scroll")
            const identifyScrollDestination = await identifyNav();
            apiMessages = [apiMessages[apiMessages.length-1]];
            let apiRequestBody;
            const scrollSystemMessage = {
                "role": "system",
                "content": "You are a chatbot assistant for an online mattress retailer. " +
                    "You are helping the user navigate to a new part in the website. " +
                    "From the following array, identify the link that most" +
                    " closely resembles what the user is trying to navigate to" +
                    " return just that exact link, if nothing is close return NOID "
                    +JSON.stringify(identifyScrollDestination)
            }



            apiRequestBody = {
                "model": "gpt-3.5-turbo", "messages": [
                    scrollSystemMessage,  // The system message DEFINES the logic of our chatGPT
                    ...apiMessages // The messages from our chat with ChatGPT
                ]
            };

            console.log("scroll api request")
            console.log(apiRequestBody);

            await fetch("https://api.openai.com/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + API_KEY,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(apiRequestBody)
                }).then((data) => {
                return data.json();
            }).then( async (data) => {
                console.log("return from scroll gpt")
                console.log(data);
                console.log(data.choices[0].message.content);
                const tag = data.choices[0].message.content;
                if (tag == "NOID") {
                    addNewMessage(chatMessages, "SaatvaAssistant was not able to identify the link you wanted to navigate to. Please try again!");
                } else {
                    await navTo(tag);
                }

                addNewMessage(chatMessages, "SaatvaAssistant has navigated to that page!");
                return;


                // addNewMessage(chatMessages, );
            }).catch((error)=>{
                console.error(error);
                addNewMessage(chatMessages, "SaatvaAssistant has encountered an error. Please try again!");
            });

            return




        }



        const documentText = await retrieveText();

        // Get the request body set up with the model we plan to use
        // and the messages which we formatted above. We add a system message in the front to'
        // determine how we want chatGPT to act.
        let apiRequestBody;
        apiRequestBody = {
            "model": "gpt-3.5-turbo", "messages": [
                systemMessage(documentText),  // The system message DEFINES the logic of our chatGPT
                ...apiMessages // The messages from our chat with ChatGPT
            ]
        };

        console.log("request body");
        console.log(apiRequestBody);

        await fetch("https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(apiRequestBody)
            }).then((data) => {
            return data.json();
        }).then((data) => {
            console.log(data);
            // setMessages([...chatMessages, {
            //     message: data.choices[0].message.content,
            //     sender: "ChatGPT"
            // }]);
            // setIsTyping(false);

            addNewMessage(chatMessages, data.choices[0].message.content);
        }).catch((error)=>{
            console.error(error);
            addNewMessage(chatMessages, "SaatvaAssistant has encountered an error. Please try again!");
        });

    }

    function cleanText(text) {
        // Replace "\n" with "|"
        let cleanedText = text.replace(/\n/g, "|");

        // Remove "[object Object]"
        cleanedText = cleanedText.replace(/\[object Object\]/g, "");

        // Remove "Was this review helpful?"
        cleanedText = cleanedText.replace(/Was this review helpful\?/g, "");

        // Remove "Read More" and "Read more"
        cleanedText = cleanedText.replace(/Read More/gi, ""); // 'gi' makes the regex case insensitive

        // Remove "Learn More"
        cleanedText = cleanedText.replace(/Learn More/g, "");

        // Remove "Back to top"
        cleanedText = cleanedText.replace(/Back to top/g, "");

        // Remove "slide page {int} of {int}"
        cleanedText = cleanedText.replace(/slide page \d+ of \d+/g, "");

        // Replace "Share Review by {name} on {1-30} Apr {2009-2024}" with "end review"
        const reviewPattern = /Share Review by .*? on [1-30] Apr (20(?:0[9]|1\d|2[0-4]))/g;
        cleanedText = cleanedText.replace(reviewPattern, "end review");

        return cleanedText;
    }


    return (
        <div className="App">
            <img src={"./chat-bot.svg"} style={{height:80, width:80, alignItems: 'left'}} />
            <img src={"./saa.avif"} style={{height:80, width:150}} />
            <div style={{position: "relative", height: "85vh", width: "85vw"}}>
                <MainContainer>
                    <ChatContainer>
                        <MessageList
                            scrollBehavior="smooth"
                            typingIndicator={isTyping ? <TypingIndicator content="SaatvaAssistant is typing"/> : null}
                        >
                            {messages.map((message, i) => {
                                console.log(message)
                                return <Message key={i} model={message} />
                            })}
                        </MessageList>
                        <MessageInput placeholder="Type message here" onSend={handleSend} attachButton={false}/>
                    </ChatContainer>
                </MainContainer>
            </div>
        </div>
    )
}

export default App
