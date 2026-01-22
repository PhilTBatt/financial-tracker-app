import { Component } from '@angular/core';
import { StyledCard } from '../styled-card/styled-card';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-system-architecture',
  imports: [StyledCard, NgClass],
  templateUrl: './system-architecture.html',
  styleUrl: './system-architecture.scss'
})

export class SystemArchitecture {
  steps = [
    { key: 'angular', label: 'ANGULAR FRONTEND', icon: 'assets/diagram/angular.svg' },
    { key: 'java',    label: 'JAVA API',         icon: 'assets/diagram/java.svg' },
    { key: 's3',      label: 'AWS S3',           icon: 'assets/diagram/s3.svg' },
    { key: 'lambda',  label: 'PYTHON LAMBDA',    icon: 'assets/diagram/lambda.svg' },
    { key: 'ddb',     label: 'DYNAMODB',         icon: 'assets/diagram/dynamodb.svg' },
    { key: 'update',  label: 'API & UI UPDATE',  icon: 'assets/diagram/update.svg' },
    ]
}