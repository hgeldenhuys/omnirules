import { Get, Post, Route, Body, Query, Header, Path, SuccessResponse, Controller } from "tsoa";
import { MultiAxisTable, IMultiAxisTable, RuleSet } from "./author";


@Route("MultiAxisTables")
// @ts-ignore
export class MultiAxisTableController extends Controller {
    @Post()
    // @ts-ignore
    public async generate(@Body() request: IMultiAxisTable): MultiAxisTable {
        const table = new MultiAxisTable(undefined, request);
        this.setStatus(201); // set return status 201
        return table;
    }
}