import { Component, Input } from "@angular/core";

@Component({
    selector: 'styled-card',
    imports: [],
    templateUrl: './styled-card.html',
    styleUrl: './styled-card.scss',
    host: { 'class': 'styled-card' }
})

export class StyledCard {
}