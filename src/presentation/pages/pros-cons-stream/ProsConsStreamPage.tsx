
import { useRef, useState } from "react"
import { GptMessage, MyMessage, TextMessageBox, TypingLoader } from "../../components";
import { prosConsStreamGeneratorUseCase, prosConsStreamUseCase } from "../../../core/use-cases";


interface Message {
  text: string;
  isGpt: boolean;
}

export const ProsConsStreamPage = () => {
  const abortController = useRef(new AbortController());
  // ref porque no se necesita renderizar nada si 'esta corriendo' (isRunning)
  const isRunning = useRef(false);

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async(text: string) => {
    if (isRunning.current) {
      // al dar un nuevo 'enviar' se aborta el anterior stream con .abort() si esta corriendo
      abortController.current.abort();
      // se tiene que crear uno nuevo, sino se cancelaría el nuevo stream (la nueva comparación) que se va a realizar
      abortController.current = new AbortController();
    }

    setIsLoading(true);
    isRunning.current = true;
    setMessages((prev) => [...prev, { text, isGpt :false }]);
    const stream = prosConsStreamGeneratorUseCase(text, abortController.current.signal);
    setIsLoading(false);
    setMessages((messages) => [...messages, { text: '', isGpt: true }]);
    for await (const text of stream) {
      setMessages((messages) => {
        const newMessages = [...messages];
        newMessages[newMessages.length - 1 ].text = text;
        return newMessages;
      });
    }
    isRunning.current = false;
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          <GptMessage text="¿Que deseas comparar hoy?" />
          {
            messages.map((message, index) => (
              message.isGpt
                ? (
                  <GptMessage key={ index } text={ message.text }/>
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


