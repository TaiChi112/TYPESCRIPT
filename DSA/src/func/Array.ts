import { Data } from './../interface/Array';
function addData(data: Data[], newData: Data): Data[] {
    return [...data, newData]
}

function getData(data: Data[]): Data[] {
    return [...data]
}

function getDataById(data: Data[], id: number): Data | undefined {
    return data.find(data => data.id === id)
}

function updateData(data: Data[], id: number, newName: string): Data[] {
    return data.map(data => data.id === id ? { ...data, data: newName } : data)
}

function deleteData(data: Data[], id: number): Data[] {
    return data.filter(data => data.id !== id)
}

export = { addData, getData, getDataById, updateData, deleteData }