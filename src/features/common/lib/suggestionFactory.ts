/* eslint-disable @typescript-eslint/no-explicit-any */
import { computePosition, flip, shift } from "@floating-ui/dom"
import { posToDOMRect, ReactRenderer } from "@tiptap/react"
import { Editor } from "@tiptap/core"
import { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion"
import MentionsList from "../components/MentionsList"

const updatePosition = (editor: Editor, element: HTMLElement): void => {
  const virtualElement = {
    getBoundingClientRect: (): DOMRect =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to,
      ),
  }

  computePosition(virtualElement, element, {
    placement: "bottom-start",
    strategy: "absolute",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = "max-content"
    element.style.position = strategy
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  })
}

export interface MentionSuggestion {
  id: string;
  label: string;
  image: string;
}

const suggestionFactory = (
  data: MentionSuggestion[],
): Omit<SuggestionOptions<MentionSuggestion, any>, "editor"> => {
  return {
    items: ({ query }) => {
      return data
        .filter(item =>
          item.label.toLowerCase().startsWith(query.toLowerCase()),
        )
        .slice(0, 5);
    },

    render: () => {
      let component: ReactRenderer<{ onKeyDown: (props: { event: KeyboardEvent }) => boolean }> | null = null

      return {
        onStart: (props: SuggestionProps<MentionSuggestion, any>) => {
          component = new ReactRenderer(MentionsList, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect || !(component.element instanceof HTMLElement)) {
            return
          }

          component.element.style.position = "absolute"
          document.body.appendChild(component.element)
          updatePosition(props.editor, component.element)
        },

        onUpdate(props: SuggestionProps<MentionSuggestion, any>) {
          component?.updateProps(props)

          if (!props.clientRect || !(component?.element instanceof HTMLElement)) {
            return
          }

          updatePosition(props.editor, component.element)
        },

        onKeyDown(props: { event: KeyboardEvent }) {
          if (props.event.key === "Escape") {
            component?.destroy()
            return true
          }

          return component?.ref?.onKeyDown(props) ?? false
        },

        onExit() {
          if (component && component.element instanceof HTMLElement) {
            component.element.remove()
            component.destroy()
          }
        },
      }
    },
  }
}

export default suggestionFactory
