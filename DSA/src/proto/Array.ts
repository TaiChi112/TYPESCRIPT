import { Data } from "../interface/Array";

export function addItem(data: Data[], newItem: Data): Data[] {
    return [...data, newItem]
}