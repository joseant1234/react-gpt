import { useState } from "react"
import { GptMessage, MyMessage, TextMessageBox, TypingLoader } from "../../components"
import { proConsUseCase } from "../../../core/use-cases";

interface Message {
  text: string;
  isGpt: boolean;
  info?: {
    userScore: number;
    errors: string[];
    message: string;
  }
}

export const ProsConsPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async(text: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text, isGpt: false }]);
    const { ok, content } = await proConsUseCase(text);
    setIsLoading(false);
    if (!ok) return;
    setMessages((prev) => [...prev, { text: content, isGpt: true }]);
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessage text="Puedes escribir lo que sea que quieres que compare y te de mi punto de vista" />
          {
            messages.map((message, index) => (
              message.isGpt
                ? (
                  <GptMessage
                    key={ index }
                    text={ message .text }
                  />
                )
                : (
                  <MyMessage key={ index } text={ message.text } />
                )
            ))
          }
          {
            isLoading && (
              <div className="col-start-1 col-end-12 fade-in">
                <TypingLoader/>
              </div>
            )
          }

        </div>
      </div>
      <TextMessageBox
        onSendMessage={handlePost}
        placeholder="Escribe aquí lo que deseas"
        disableCorrections={ true }
      />
    </div>
  )
}


