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
  },
  Transform: {
    tier: "verified",
    label: "Nuke-tested · 16/16 arguments passed",
    hideDescription: true,
    overview: "Transform repositions a 2D image with translation, rotation, scale, and skew around a chosen center point. It is commonly used to place elements, add simple animation, apply tracked motion, or introduce motion blur.",
    synopsisArguments: ["translate", "rotate", "scale", "center", "filter", "black_outside", "motionblur"],
    argumentOverrides: {
      translate: { description: "Horizontal and vertical movement in pixels." },
      rotate: { description: "Clockwise rotation in degrees around the Center point." },
      scale: { description: "Horizontal and vertical scale multiplier. A value of 1 preserves the original size." },
      center: { description: "Pivot point used for rotation, scaling, and skewing." },
      filter: { description: "Resampling filter used when pixels move or scale. Cubic is a practical general-purpose default." },
      black_outside: { description: "Fills pixels outside the transformed input bounds with black. Disable it when edge pixels need to extend beyond the source bounds." },
      matrix: {
        type: "Matrix4 / Transform2d_Knob",
        examplesHtml: '<span class="source-note">Advanced / derived</span>',
        description: "Derived 4×4 matrix behind the visible transform controls. The identity matrix produces no visual change, and direct component editing is rarely useful in normal compositing scripts. Prefer Translate, Rotate, Scale, Skew, and Center; use value() only when another tool needs the composed Matrix4."
      },
      motionblur: { description: "Controls the number of motion-blur samples. Zero disables motion blur; higher values improve smoothness at additional render cost." },
      shutter: { description: "Duration of the motion-blur exposure measured in frames." }
    }
  },
  Unpremult: {
    tier: "verified",
    label: "Nuke-tested · 3/3 arguments passed",
    hideDescription: true,
    overview: "Unpremult divides selected color channels by an alpha channel, recovering the unassociated RGB values beneath soft or partially transparent edges. Use it before color corrections on premultiplied elements, then add a Premult afterward to restore the RGB-alpha relationship.",
    synopsisArguments: ["channels", "alpha", "invert"],
    example: { title: "Restore premultiplication after a color correction", code: '# Build an Unpremult -> Grade -> Premult workflow.\nelement = nuke.createNode("ColorWheel")\nunpremult = nuke.createNode("Unpremult")\nunpremult.setInput(0, element)\ngrade = nuke.createNode("Grade")\ngrade.setInput(0, unpremult)\ngrade["multiply"].setValue(1.15)\n\n# Multiply corrected RGB by alpha again before an Over composite.\npremult = nuke.createNode("Premult")\npremult.setInput(0, grade)\npremult["channels"].setValue("rgb")\npremult["alpha"].setValue("alpha")' },
    argumentOverrides: {
      channels: { description: "Channels to divide by the selected alpha source. RGB is the standard choice for normal premultiplied imagery." },
      alpha: { description: "Channel used as the divisor. Alpha is the standard source for an RGBA element." },
      invert: { description: "Divides by one minus the selected alpha channel instead of the alpha itself." }
    }
  },
  Premult: {
    tier: "documented", label: "Ready for Nuke audit · 3 arguments", hideDescription: true,
    overview: "Premult multiplies selected color channels by an alpha channel, restoring the RGB-alpha relationship required for a standard Over composite. Use it after operations performed on unpremultiplied RGB; avoid applying it again to imagery that is already premultiplied.",
    synopsisArguments: ["channels", "alpha", "invert"],
    argumentOverrides: {
      channels: { description: "Channels to multiply by the selected alpha source. RGB is the standard choice." },
      alpha: { description: "Channel used as the multiplier. Alpha is the standard source for RGBA imagery." },
      invert: { description: "Multiplies by one minus the selected alpha channel instead of alpha." }
    }
  },
  Saturation: {
    tier: "documented", label: "Ready for Nuke audit · 12 arguments", hideDescription: true,
    overview: "Saturation changes color intensity without directly changing image luminance. A value of 0 produces grayscale, 1 preserves the input, and values above 1 increase color intensity.",
    synopsisArguments: ["channels", "saturation", "mode", "mix", "unpremult"],
    example: { title: "Create a controlled muted-color treatment", code: '# Create a source so the example runs in an empty script.\nsource = nuke.createNode("ColorWheel")\nsat = nuke.createNode("Saturation")\nsat.setInput(0, source)\nsat["channels"].setValue("rgb")\nsat["mode"].setValue("Rec 709")\n\n# Reduce color intensity while retaining some original color.\nsat["saturation"].setValue(0.35)\nsat["mix"].setValue(0.85)' },
    argumentOverrides: {
      saturation: { description: "Color-intensity multiplier: 0 is grayscale, 1 is unchanged, and values above 1 increase saturation." },
      mode: { description: "Luminance calculation used while adjusting saturation. Rec 709 is the normal modern default." },
      fringe: { description: "Softens the mask boundary so the saturation adjustment transitions more gradually." }
    }
  },
  Crop: {
    tier: "documented", label: "Ready for Nuke audit · 7 arguments", hideDescription: true,
    overview: "Crop limits an image and its bounding box to a rectangular region. It can preserve the original coordinate system or move the cropped region to the origin and create a matching output format.",
    synopsisArguments: ["box", "crop", "reformat", "intersect", "softness"],
    example: { title: "Crop ten percent from every edge", code: '# Create a source and crop relative to its format.\nsource = nuke.createNode("CheckerBoard2")\nwidth = source.width()\nheight = source.height()\nmargin_x = width * 0.10\nmargin_y = height * 0.10\n\ncrop = nuke.createNode("Crop")\ncrop.setInput(0, source)\ncrop["box"].setValue([margin_x, margin_y, width - margin_x, height - margin_y])\n\n# Move the result to 0,0 and match the format to the crop.\ncrop["crop"].setValue(True)\ncrop["reformat"].setValue(True)' },
    argumentOverrides: {
      box: { description: "Crop rectangle in left, bottom, right, top pixel coordinates." },
      crop: { description: "Adds a black boundary so pixels outside the crop rectangle evaluate as black." },
      reformat: { description: "Moves the cropped region to 0,0 and changes the output format to the crop size." },
      reset: { type: "Script_Knob / button", examplesHtml: '<span class="source-note">UI action</span>', description: "Properties-panel button that resets the crop box; not a normal value argument." }
    }
  },
  Reformat: {
    tier: "documented", label: "Ready for Nuke audit · 15 arguments", hideDescription: true,
    overview: "Reformat converts an image to a new resolution or pixel aspect ratio. Use Fit to preserve the entire image, Fill to cover the output while cropping excess, or Distort when independent width and height scaling is intentional.",
    synopsisArguments: ["type", "resize", "format", "box_width", "box_height", "filter", "center"],
    example: { title: "Fit an image into a 1280 × 720 delivery frame", code: '# Create a source and fit it inside a fixed HD delivery box.\nsource = nuke.createNode("CheckerBoard2")\nreformat = nuke.createNode("Reformat")\nreformat.setInput(0, source)\nreformat["type"].setValue("to box")\nreformat["box_width"].setValue(1280)\nreformat["box_height"].setValue(720)\nreformat["box_pixel_aspect"].setValue(1.0)\nreformat["box_fixed"].setValue(True)\nreformat["resize"].setValue("fit")\nreformat["center"].setValue(True)\nreformat["filter"].setValue("cubic")' },
    argumentOverrides: {
      format: { type: "Format / Format_Knob", examplesHtml: '<span class="source-note">nuke.Format</span>', description: "Output format object or registered project-format name when Type is set to to format." },
      resize: { description: "Scaling policy: none, width, height, fit, fill, or distort." },
      pbb: { description: "Preserves pixels outside the output format bounding box instead of clipping them." }
    }
  },
  Shuffle2: {
    tier: "needs-research", label: "Special scripting control · needs Nuke research", hideDescription: true,
    overview: "Shuffle rearranges channels between layers and supports mappings from two inputs. Its mapping UI is stored in a compound NoodleKnob rather than ordinary scalar arguments, so generic knob-setting examples are intentionally withheld until its script representation is verified.",
    synopsisArguments: [],
    argumentOverrides: {
      shuffle: { type: "NoodleKnob / channel mapping data", examplesHtml: '<span class="source-note">Special control</span>', description: "Compound channel-routing data used by the Shuffle mapping UI. Do not treat it as a float despite the scanner's current classification." }
    },
    suppressExamples: true
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

    if (entry.example) {
      const examples = page.querySelector(".examples");
      if (examples) examples.innerHTML = `<div class="example-item"><div class="example-title">${escapeHtml(entry.example.title)}</div><pre class="code">${highlightPython(entry.example.code)}</pre></div>`;
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
