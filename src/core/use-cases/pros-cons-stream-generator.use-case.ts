
export async function* prosConsStreamGeneratorUseCase(prompt: string, abortSignal: AbortSignal) {
    try {
        const resp = await fetch(`${import.meta.env.VITE_GPT_API}/pros-cons-discusser-stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt }),
            signal: abortSignal,
        });

        if (!resp.ok) throw new Error('No se pudo realizar la comparación');
        const reader = resp.body?.getReader(); // con '?' porque puede ser que no salga bien y se obtenga un body undefined, se podría poner body! porque con el resp.ok se esta asegurando que si se obtenga respuesta
        if (!reader) {
            console.log('No se pudo obtener el reader');
            return null;
        }


        const decoder = new TextDecoder();
        // en la variable text se irá concatenando todas las emisiones que el stream de informacion va dando
        let text = ''
        while (true) {
            const { value, done } = await reader.read();
            // cuando se haya completado, no halla mas información, es decir ya se emitió la respuesta
            if (done) {
                break;
            }
            const decoderChunk = decoder.decode(value, { stream: true });
            text += decoderChunk;
            // lo que se quiere regresar va en yield
            yield text;
        }

    } catch (error) {
        console.log(error);
        return null;
    }
}