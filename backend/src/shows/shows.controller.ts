import { Controller, Get, Param } from '@nestjs/common';
import { ShowsService } from './shows.service';

@Controller('shows')
export class ShowsController {
    constructor(private showsService: ShowsService) { }

    @Get()
    getAllShows() {
        return this.showsService.getAllShows();
    }

    @Get(':slug')
    getShowBySlug(@Param('slug') slug: string) {
        return this.showsService.getShowBySlug(slug);
    }
}
