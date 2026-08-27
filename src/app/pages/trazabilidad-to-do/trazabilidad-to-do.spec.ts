import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrazabilidadToDo } from './trazabilidad-to-do';

describe('TrazabilidadToDo', () => {
  let component: TrazabilidadToDo;
  let fixture: ComponentFixture<TrazabilidadToDo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrazabilidadToDo],
    }).compileComponents();

    fixture = TestBed.createComponent(TrazabilidadToDo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
