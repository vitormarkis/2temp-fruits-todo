import { baseURL } from "@constants/constants"
import { AssetType } from "@features/asset-slice/types"
import { TagType } from "@features/tag-slice/types"
import { NamedColor } from "@myTypes/colorTypes"
import { queryClient } from "@services/queryClient"
import { eraseFields, removeTag } from "@utils/index"
import axios from "axios"
import { HTMLAttributes, useEffect, useState } from "react"

import EditTag from "@components/EditTag"
import PopoverButton from "@components/quark/PopoverButton"
import { resetEditingTagId, setEditingTagId } from "@features/context-slice"
import { useAppSelector } from "@features/store"
import { setTagEditFields } from "@features/tag-slice"
import * as Popover from "@radix-ui/react-popover"
import { useDispatch } from "react-redux"

interface Props extends HTMLAttributes<HTMLDivElement> {
  _bg?: `#${string}` | NamedColor
  _color?: `#${string}` | NamedColor
  _tag: TagType
  _assetId: string
  _container?: Element | null
  _popover?: boolean
}

const Tag: React.FC<Props> = props => {
  const dispatch = useDispatch()
  const { editFields } = useAppSelector(state => state.tag)
  const {
    _bg: bg,
    _color: color,
    _tag: tag,
    _assetId: assetId,
    _container: container,
    _popover: popover,
    ...rest
  } = props
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const actionAttributes = {
    edit: {
      title: "Editar a tag",
      description: "Insira as novas informações da tag...",
    },
  }

  function handleDeleteTag(assetId: string, tag: TagType) {
    const { id: tagId } = tag
    const assetsInCache = queryClient.getQueryData<AssetType[]>("assets")!
    const { assets, asset } = removeTag(assetId, tagId, assetsInCache)!
    queryClient.setQueryData("assets", assets)
    axios.put(`${baseURL}/${assetId}`, asset)
  }

  function handleClickDownOutside() {
    dispatch(resetEditingTagId())
    dispatch(setTagEditFields(eraseFields(editFields)))
  }

  useEffect(() => {
    console.log(isPopoverOpen)
  }, [isPopoverOpen])

  return (
    <Popover.Root
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
    >
      <Popover.Trigger>
        <div
          className="leading-none p-1 rounded-sm text-xs flex gap-2 items-center"
          style={{
            backgroundColor: bg ?? "#52525B",
            color: color ?? "#fff",
          }}
          {...rest}
        >
          <p>{tag.tag_name}</p>
          <p
            onClick={() => handleDeleteTag(assetId, tag)}
            className="cursor-pointer p-1 rounded-full bg-black/20 mr-1 w-2.5 h-2.5"
          />
        </div>
      </Popover.Trigger>
      {popover && (
        <Popover.Portal>
          <Popover.Content
            onPointerDownOutside={handleClickDownOutside}
            side="right"
            align="center"
            sticky="always"
            collisionBoundary={container}
            collisionPadding={{ left: 16 }}
            hideWhenDetached={true}
            className="plate py-2 rounded-md bg-slate-800 shadow-md shadow-black/20 flex flex-col text-xs"
          >
            <PopoverButton
              action="Excluir"
              event={() => handleDeleteTag(assetId, tag)}
            />
            <PopoverButton
              action="Editar"
              event={() => dispatch(setEditingTagId(tag.id))}
              element={
                <EditTag
                  actionAttrs={actionAttributes.edit}
                  tag={tag}
                  setIsPopoverOpen={setIsPopoverOpen}
                />
              }
            />
            <Popover.Arrow
              fill="#1E293B"
              width={4}
              height={4}
            />
            {/* <Popover.Close>XIS</Popover.Close> */}
          </Popover.Content>
        </Popover.Portal>
      )}
    </Popover.Root>
  )
}

export default Tag
