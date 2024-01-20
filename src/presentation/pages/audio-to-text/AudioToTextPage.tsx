
import { useState } from "react"
import { GptMessage, MyMessage, TextMessageBoxFile, TypingLoader } from "../../components";
import { audioToTextUseCase } from "../../../core/use-cases";
import { formatMessage, formatSegmentMessage } from "./format-message";


interface Message {
  text: string;
  isGpt: boolean;
}

export const AudioToTextPage = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async(text: string, audioFile: File) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text, isGpt :false }]);
    const resp = await audioToTextUseCase(audioFile, text);
    setIsLoading(false);
    if (!resp) return; // sucedió un error
    const gptMessage = formatMessage(resp);
    setMessages((prev) => [...prev, { text: gptMessage, isGpt :true }]);
    for (const segment of resp.segments) {
      const segmentMessage = formatSegmentMessage(segment);
      setMessages((prev) => [...prev, { text: segmentMessage, isGpt :true }]);
    }

  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessage text="Hola, ¿qué texto quieres generar hoy?" />
          {
            messages.map((message, index) => (
              message.isGpt
                ? (
                  <GptMessage key={ index } text={ message.text } />
                )
                : (
                  <MyMessage key={ index } text={ (message.text === '') ? 'Transcribe el audio' : message.text} />
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
      <TextMessageBoxFile
        onSendMessage={ handlePost }
        placeholder="Escribe aquí lo que deseas"
        disableCorrections={ true }
        accept="audio/*"
      />
    </div>
  )
}


