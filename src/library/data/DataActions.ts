export type DataAction =
{ type: "Data_ClickedCategory", category: any } |
{ type: "Data_ScrolledToCategory", category: any } |
{ type: "Data_AddCatalog" } |
{ type: "Data_SaveCatalog", name: string, data: string } |
{ type: "Data_CancelCatalog" };