import { Component } from "@angular/core";
import { StyledCard } from "../styled-card/styled-card";

@Component({
    selector: 'app-header',
    imports: [StyledCard],
    templateUrl: './header.html',
    styleUrl: './header.scss',
    host: { 'class': 'header' }
})

export class Header {}