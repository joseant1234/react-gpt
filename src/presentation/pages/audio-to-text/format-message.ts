import { AudioToTextResponse, Segment } from "../../../interfaces"

export const formatMessage = (resp: AudioToTextResponse) => {
    return (
`
## Transcripción:
__Duración.__${Math.round(resp.duration)} segundos
## El texto es:
${resp.text}
`
)
}

export const formatSegmentMessage = (segment: Segment) => {
    return (
`
__De ${Math.round(segment.start)} a ${Math.round(segment.end)} segundos:__
${segment.text}
        `
    );
}

