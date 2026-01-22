import { Component } from '@angular/core';
import { StyledCard } from '../styled-card/styled-card';

@Component({
  selector: 'app-system-architecture',
  imports: [StyledCard],
  templateUrl: './system-architecture.html',
  styleUrl: './system-architecture.scss'
})

export class SystemArchitecture {
  steps = [
    'ANGULAR FRONTEND',
    'JAVA API',
    'AWS S3',
    'PYTHON LAMBDA',
    'DYNAMODB',
    'API & UI UPDATE'
  ]
}