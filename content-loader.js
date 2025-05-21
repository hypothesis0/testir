backend:
  name: git-gateway
  branch: main

# 更新媒体文件夹路径以匹配实际结构
media_folder: "img/uploads"
public_folder: "img/uploads"

collections:
  - name: "content"
    label: "Content"
    files:
      - name: "fellowship"
        label: "Fellowship Page"
        file: "fellowship-data.json"
        fields:
          - {label: "Page Title", name: "title", widget: "string", required: false}
          - {label: "Main Heading", name: "heading", widget: "string", required: false}
          - {label: "Introduction", name: "intro", widget: "markdown", required: false}
          - {label: "Cohort Title", name: "cohort_title", widget: "string", required: false}
          - label: "Fellows"
            name: "fellows"
            widget: "list"
            required: false
            fields:
              - {label: "Fellow Number", name: "number", widget: "string", required: false}
              - {label: "Fellow Name", name: "name", widget: "string", required: false}
              - {label: "Fellow ID", name: "id", widget: "string", required: false, hint: "Unique ID (e.g., te-editions-2025)"}
              - {label: "Fellow Title", name: "title", widget: "string", required: false}
              - {label: "Fellow Bio", name: "bio", widget: "markdown", required: false}
              - label: "Image Type"
                name: "image_type"
                widget: "select"
                options:
                  - {label: "Single Image", value: "single"}
                  - {label: "Carousel", value: "carousel"}
                default: "single"
                required: false
              
              # 图片上传字段 - 所有可选
              - {label: "Image", name: "image", widget: "image", required: false, hint: "Main image or first carousel image"}
              - {label: "Image Caption", name: "caption", widget: "string", required: false}
              
              # 额外的轮播图片 - 可选
              - label: "Additional Carousel Images"
                name: "additional_images"
                widget: "list"
                required: false
                hint: "Only for carousel image type - add additional images here"
                fields:
                  - {label: "Image", name: "src", widget: "image", required: false}
                  - {label: "Caption", name: "caption", widget: "string", required: false}
  
  # 共享元素管理
  - name: "shared"
    label: "Shared Elements"
    files:
      # 导航菜单管理
      - name: "navigation"
        label: "Navigation Menu"
        file: "shared/navigation.html"
        fields:
          - label: "Desktop Navigation"
            name: "desktop_nav"
            widget: "object"
            fields:
              - label: "Main Menu Items"
                name: "main_items"
                widget: "list"
                fields:
                  - {label: "Menu Text", name: "text", widget: "string"}
                  - {label: "Link", name: "url", widget: "string"}
                  - label: "Submenu Items"
                    name: "submenu"
                    widget: "list"
                    required: false
                    fields:
                      - {label: "Menu Text", name: "text", widget: "string"}
                      - {label: "Link", name: "url", widget: "string"}
          
          - label: "Mobile Navigation"
            name: "mobile_nav"
            widget: "object"
            fields:
              - label: "Main Menu Items"
                name: "main_items"
                widget: "list"
                fields:
                  - {label: "Menu Text", name: "text", widget: "string"}
                  - {label: "Link", name: "url", widget: "string"}
                  - label: "Submenu Items"
                    name: "submenu"
                    widget: "list"
                    required: false
                    fields:
                      - {label: "Menu Text", name: "text", widget: "string"}
                      - {label: "Link", name: "url", widget: "string"}
      
      # 页脚管理
      - name: "footer"
        label: "Footer"
        file: "shared/footer.html"
        fields:
          - {label: "Address Text", name: "address_text", widget: "string"}
          - {label: "Background Color", name: "bg_color", widget: "string", default: "rgb(180, 180, 180)"}
          - {label: "Text Color", name: "text_color", widget: "string", default: "rgb(23, 23, 23)"}
