import React from "react"
// logic 複用
import { useForm } from "react-hook-form" // react hook

// type 複用
import { FC } from "react" // from library type definition
import { FormValues, NestedList } from "../types/todo"

// UI Component 複用
import { ButtonGroup, Button, useToasts } from "@geist-ui/react" // any ui library
import { Todo, TodoList } from "../components/todo"

// 樣式 複用
import styled from "styled-components" // css in js
import { ContainerMixin, StyledAddButton } from "../style"
const StyledSection = styled.section`
  ${ContainerMixin}
`

const initialList: NestedList = [
  {
    value: "todo group 2",
    isDone: true,
  },
  {
    value: "todo group 1",
    isDone: false,
    list: [
      {
        value: "group todo 2",
        isDone: false,
      },
      {
        value: "group todo 1",
        isDone: true,
      },
    ],
  },
]

const TodoForm: FC = function () {
  const { control, register, getValues, setValue, handleSubmit } =
    useForm<FormValues>({
      defaultValues: {
        nestedList:
          JSON.parse(localStorage.getItem("todoList") || "") || initialList,
      },
    })
  const [, setToast] = useToasts()

  const handleSave = handleSubmit((value) => {
    localStorage.setItem("todoList", JSON.stringify(value.nestedList))
    setToast({ text: "Saved", type: "success" })
  })
  const handleLoad = () => {
    setValue("nestedList", JSON.parse(localStorage.getItem("todoList") || ""))
    setToast({ text: "Loaded", type: "secondary" })
  }
  const handleClear = () => {
    setValue("nestedList", [])
    setToast({ text: "Clear" })
  }

  return (
    <StyledSection className="flex flex-col items-center">
      <ButtonGroup className="d-flex gap-1 mx-0">
        <Button onClick={handleSave}>↑ Save</Button>
        <Button onClick={handleLoad}>↓ Load</Button>
        <Button onClick={handleClear}>X Clear</Button>
      </ButtonGroup>

      <TodoList
        name="nestedList"
        control={control}
        renderAddButton={(prepend) => (
          <ButtonGroup className="d-flex justify-center gap-1">
            <Button
              onClick={() => {
                prepend({
                  value: "",
                  isDone: false,
                })
              }}
            >
              + Todo
            </Button>
            <Button
              onClick={() =>
                prepend({
                  value: "",
                  isDone: false,
                  list: [{ value: "", isDone: false }],
                })
              }
            >
              + Group
            </Button>
          </ButtonGroup>
        )}
        renderTodo={(fieldId, index, onRemove) => (
          <div key={fieldId} className="mb-2">
            <Todo
              key={fieldId}
              onRegister={(name) => register(`nestedList.${index}.${name}`)}
              onCheck={() => {
                const todo = getValues(`nestedList.${index}`)
                todo.list?.forEach((_, subIndex) => {
                  setValue(
                    `nestedList.${index}.list.${subIndex}.isDone`,
                    todo.isDone
                  )
                })
              }}
              onRemove={onRemove}
            >
              <div className="flex gap-1">
                <Todo.TodoList
                  name={`nestedList.${index}.list`}
                  control={control}
                  renderAddButton={(prepend) => (
                    <StyledAddButton
                      onClick={() => {
                        prepend({
                          value: "",
                          isDone: false,
                        })
                        if (getValues(`nestedList.${index}.isDone`) === true) {
                          setValue(`nestedList.${index}.isDone`, false)
                        }
                      }}
                      auto
                    >
                      +
                    </StyledAddButton>
                  )}
                  renderTodo={(subField, subIndex, onRemove) => (
                    <div key={subField} className="mb-2">
                      <Todo
                        onRegister={(name) =>
                          register(
                            `nestedList.${index}.list.${subIndex}.${name}`
                          )
                        }
                        onCheck={() => {
                          const subTodoList =
                            getValues(`nestedList.${index}.list`) || []
                          if (subTodoList.every((todo) => todo.isDone)) {
                            return setValue(`nestedList.${index}.isDone`, true)
                          }
                          setValue(`nestedList.${index}.isDone`, false)
                        }}
                        onRemove={onRemove}
                      />
                    </div>
                  )}
                />
              </div>
            </Todo>
          </div>
        )}
      />
    </StyledSection>
  )
}

export default TodoForm
