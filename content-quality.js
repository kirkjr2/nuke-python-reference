const CONTENT_QUALITY = {
  Grade: {
    tier: "verified",
    label: "Nuke-tested · 22/22 arguments passed",
    hideDescription: true,
    overview: "Grade remaps an image's tonal range using black point, white point, lift, gain, multiply, offset, and gamma controls. It is commonly used for tonal matching, setting black/white points, and targeted color correction.",
    synopsisArguments: [
      "channels",
      "blackpoint",
      "whitepoint",
      "black",
      "white",
      "multiply",
      "add",
      "gamma",
      "mix",
      "reverse"
    ],
    argumentOverrides: {
      fringe: {
        description: "Softens the edge of the mask so the grade transitions more gradually at the mask boundary."
      }
    }
  },
  ModifyMetaData: {
    tier: "needs-research",
    label: "Special scripting control",
    overview: "ModifyMetaData adds, edits, or removes metadata passing through the node tree. Its metadata control is a list editor containing set/remove actions, keys, and values; it should not be treated like a normal scalar Python knob.",
    note: "The scanner currently cannot fully describe the metadata action-list API. Generic scalar examples are intentionally suppressed until a manually verified scripting example is available.",
    argumentOverrides: {
      metadata: {
        type: "List_Knob / script data",
        defaultValue: "—",
        examplesHtml: '<span class="source-note">Special control</span>',
        description: "Metadata action list. Each row specifies a set/remove action, metadata key, and optional value. Configure this control in the Properties panel or through Nuke script syntax rather than treating it as a float."
      }
    },
    suppressExamples: true
  },
  Blur: {
    tier: "verified",
    label: "Nuke-tested · 12/12 arguments passed",
    hideDescription: true,
    overview: "Blur softens an image by spreading pixel values horizontally and vertically. Use Size to control the blur radius, Filter to choose the falloff, Channels to limit which channels are affected, and Mix to blend the result with the input.",
    synopsisArguments: ["channels", "size", "filter", "mix", "crop"],
    argumentOverrides: {
      size: {
        description: "Horizontal and vertical blur size in pixels. Set one number for both axes or set each axis independently."
      },
      filter: {
        description: "Filter used to shape the blur: box, triangle, quadratic, or gaussian."
      },
      fringe: {
        description: "Softens the edge of the mask so the blur transitions more gradually at the mask boundary."
      },
      quality: {
        description: "Performance-quality threshold for very large blurs. Lower values render faster but may look less smooth."
      }
    }
  },
  Merge2: {
    tier: "verified",
    label: "Nuke-tested · 17/17 arguments passed",
    hideDescription: true,
    overview: "Merge combines foreground input A with background input B. In Python, input 0 is B and input 1 (or higher) is A. The Operation determines how their pixels and alpha interact; Over is the standard choice for placing a premultiplied foreground over a background.",
    synopsisArguments: ["operation", "Achannels", "Bchannels", "output", "mix", "bbox"],
    argumentOverrides: {
      operation: {
        description: "Compositing operation applied between A and B. Use over for a standard premultiplied foreground-over-background composite."
      },
      bbox: {
        description: "Chooses the output bounding box: the union or intersection of both inputs, or only A or B."
      },
      also_merge: {
        description: "Additional non-RGB channels to process with the selected merge operation."
      },
      fringe: {
        description: "Softens the edge of the mask so the merge transitions more gradually at the mask boundary."
      },
      metainput: {
        description: "Chooses whether output metadata comes from B, A, or both inputs. Duplicate keys from B take priority when using All."
      },
      rangeinput: {
        description: "Chooses whether the output frame range comes from B, A, or both inputs."
      }
    }
  }
};

function contentQualityCurrentNode() {
  return new URL(window.location.href).searchParams.get("node");
}

function applyContentQuality() {
  const page = document.querySelector("#page");
  if (!page) return;

    const nodeClass = contentQualityCurrentNode();
    const entry = CONTENT_QUALITY[nodeClass];

    page.querySelectorAll(".editorial-quality, .editorial-overview, .editorial-note").forEach(el => el.remove());
    if (!entry || !page.querySelector("h1")) return;

    const classLine = page.querySelector(".class-line");
    if (classLine) {
      const status = document.createElement("div");
      status.className = `editorial-quality editorial-quality-${entry.tier}`;
      status.textContent = entry.label;
      classLine.insertAdjacentElement("afterend", status);
    }

    const description = page.querySelector(".description");
    if (description && entry.hideDescription) {
      description.remove();
    }
    if (description && entry.description) {
      description.textContent = entry.description;
    }
    if (description && entry.overview) {
      const overview = document.createElement("section");
      overview.className = "editorial-overview";
      overview.innerHTML = `<div class="editorial-overview-title">Overview</div><div>${entry.overview}</div>`;
      (description.isConnected ? description : classLine)?.insertAdjacentElement("afterend", overview);

      if (entry.note) {
        const note = document.createElement("div");
        note.className = "editorial-note";
        note.textContent = entry.note;
        overview.insertAdjacentElement("afterend", note);
      }
    }

    for (const [argName, override] of Object.entries(entry.argumentOverrides || {})) {
      const row = document.querySelector(`#arg-${CSS.escape(argName)}`);
      if (!row) continue;

      if (override.type) {
        const el = row.querySelector(".arg-type");
        if (el) el.textContent = override.type;
      }
      if (override.defaultValue !== undefined) {
        const el = row.querySelector(".arg-default");
        if (el) el.textContent = override.defaultValue;
      }
      if (override.examplesHtml) {
        const el = row.querySelector(".arg-examples");
        if (el) el.innerHTML = override.examplesHtml;
      }
      if (override.description) {
        const el = row.querySelector(".arg-desc");
        if (el) el.textContent = override.description;
      }
    }

    if (entry.suppressExamples) {
      const examples = page.querySelector(".examples");
      if (examples) {
        examples.innerHTML = '<div class="no-examples">No manually verified Python example is published for this special control yet.</div>';
      }
    }
}

function contentQualitySynopsisArguments(nodeClass, argumentOrder) {
  return CONTENT_QUALITY[nodeClass]?.synopsisArguments || argumentOrder;
}
