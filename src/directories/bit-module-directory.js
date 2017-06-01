// @flow
import R from 'ramda';
import path from 'path';
import { BitId as ComponentId } from 'bit-scope-client/bit-id';
import LinksDirectory from './links-directory';
import Component from '../maps/component';
import { InlineComponentsMap, ComponentsMap } from '../maps';
import InlineComponent from '../maps/inline-component';
import Link from './link';
import MultiLink from './multi-link';
import {
  INLINE_COMPONENTS_DIRNAME,
  COMPONENTS_DIRNAME,
  MODULES_DIR,
  MODULE_NAME,
  INDEX_JS,
} from '../constants';

const bitModuleRelativePath = path.join(MODULES_DIR, MODULE_NAME);

export default class BitModuleDirectory extends LinksDirectory {
  constructor(rootPath: string) {
    super(rootPath, bitModuleRelativePath);
  }

  getComponentFilePath({ name, namespace }: { name: string, namespace: string }) {
    return path.join(this.path, namespace, name, INDEX_JS);
  }

  getNamespaceFilePath(namespace: string) {
    return path.join(this.path, namespace, INDEX_JS);
  }

  async addNamespaceLinks(componentsMap: ComponentsMap) {
    componentsMap.forEachNamespace((namespace: string, components: Component[]) => {
      this.addLink(
        MultiLink.create({
          from: this.getNamespaceFilePath(namespace),
          names: R.uniq(components.map(c => c.name)),
        }),
      );
    });
  }

  addLinksFromInlineComponents(
    inlineMap: InlineComponentsMap,
  ): Promise<Component[]> {
    return inlineMap.map((inlineComponent: InlineComponent) => {
      const sourceFile = this.getComponentFilePath({
        name: inlineComponent.name,
        namespace: inlineComponent.namespace,
      });

      const destFile = path.join(
        this.rootPath,
        INLINE_COMPONENTS_DIRNAME,
        inlineComponent.filePath,
      );

      this.addLink(
        Link.create({
          from: sourceFile,
          to: destFile,
        }),
      );

      return inlineComponent;
    });
  }

  addLinksFromProjectDependencies(
    componentsMap: ComponentsMap,
    dependenciesArray: string[],
  ): Component[] {
    return dependenciesArray.map((componentIdStr: string) => {
      const componentId = ComponentId.parse(componentIdStr);
      const component = componentsMap.getComponent(componentId);

      const sourceFile = this.getComponentFilePath({
        name: component.name,
        namespace: component.namespace,
      });

      const destFile = path.join(
        this.rootPath,
        COMPONENTS_DIRNAME,
        component.filePath,
      );

      this.addLink(
        Link.create({
          from: sourceFile,
          to: destFile,
        }),
      );

      return component;
    });
  }

  addLinksFromStageComponents(
    componentsMap: ComponentsMap,
  ): Component[] {
    return componentsMap.getLatestStagedComponents().map((component) => {
      const sourceFile = this.getComponentFilePath({
        name: component.name,
        namespace: component.namespace,
      });

      const destFile = path.join(
        this.rootPath,
        COMPONENTS_DIRNAME,
        component.filePath,
      );

      this.addLink(
        Link.create({
          from: sourceFile,
          to: destFile,
        }),
      );

      return component;
    });
  }
}
