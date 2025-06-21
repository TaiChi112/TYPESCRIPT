export interface IPage {
    set_page_width(width: number): void;
    set_page_height(height: number): void;
    show_info_page(): string;
    get_page_width(): number;
    get_page_height(): number;
}