export interface WooMenuItem {
  id: number;
  title: {
    rendered: string;
  };
  status: string;
  url: string;
  attr_title: string;
  description: string;
  type: string;
  type_label: string;
  object: string;
  object_id: number;
  parent: number;
  menu_order: number;
  target: string;
  classes: string[];
  xfn: string[];
  invalid: boolean;
  meta: any[];
  menus: number;
}

export interface WooMenu {
  id: number;
  name: string;
  slug: string;
  description: string;
  meta: any;
  locations: string[];
  items: WooMenuItem[];
}
