# Test Cases – VTKN-384: Badge Print View

---

## TC-01: Print Page Button Visibility & Clickability

**Precondition:** User navigates to any published Badge page in UAT.  
**Steps:**
1. Open each badge variant covered in TC-06 through TC-10.
2. Confirm the "Print Page" button is visible on each page.
3. Click the "Print Page" button on each page.

**Expected Result:** Button is present and clickable on all Badge pages without errors.

---

## TC-02: Pop-up Dialog Appears on Button Click

**Precondition:** User is on a published Badge page.  
**Steps:**
1. Click the "Print Page" button.
2. Observe the UI response.

**Expected Result:** A pop-up dialog opens and displays the print view of the Badge page.

---

## TC-03: Print View Matches Figma Design

**Precondition:** Pop-up dialog is open for each badge variant.  
**Steps:**
1. Open the print view dialog for each badge type (TC-06 through TC-10).
2. Compare the layout side-by-side with the Figma design and 1-column layout spec.
3. Check typography, spacing, colors, section order, and overall structure.

**Expected Result:** Print view matches the Figma design exactly for all badge variants.

---

## TC-04: Physical Print Output Matches Design (Letter Size)

**Precondition:** Pop-up print dialog is open.  
**Steps:**
1. Click the browser's print action from within the dialog.
2. Set paper size to **Letter**.
3. Print to a physical printer.
4. Compare the printed output against the Figma design.

**Expected Result:** Printed output on Letter-size paper matches the design format; content is not cut off or broken across pages unexpectedly.

---

## TC-05: PDF Save Output Matches Design

**Precondition:** Pop-up print dialog is open.  
**Steps:**
1. Click the browser's print action from within the dialog.
2. Select "Save as PDF" as the destination.
3. Save the PDF and open it.
4. Compare against the Figma design.

**Expected Result:** Saved PDF matches the design format and all content is correctly rendered.

---

## TC-06: Badge with 3 Steps and Activities

**Badge attributes required:**
- Program level: Daisy (youngest level)
- Exactly 3 steps
- Each step has at least one activity associated with it
- No handouts section

**Steps:**
1. Locate a Daisy-level badge in UAT matching the above attributes.
2. Open its print view dialog.
3. Verify all 3 steps are displayed with their labels, descriptions, and associated activities.
4. Confirm the overall layout matches the Figma design for this step count.

**Expected Result:** All 3 steps and their activities render completely and correctly in the print view with no missing or broken sections.

---

## TC-07: Badge with 5 Steps and Activities

**Badge attributes required:**
- Program level: Brownie
- Exactly 5 steps
- Each step has at least one activity associated with it
- No handouts section

**Steps:**
1. Locate a Brownie-level badge in UAT matching the above attributes.
2. Open its print view dialog.
3. Verify all 5 steps are displayed with their labels, descriptions, and associated activities.
4. Confirm layout accommodates the larger step count without overflow or clipping.

**Expected Result:** All 5 steps and activities are present and correctly formatted within the print view layout.

---

## TC-08: Badge with Steps Only (No Activities)

**Badge attributes required:**
- Program level: Senior
- Multiple steps (3 or more)
- No activities associated with any step
- No handouts section

**Steps:**
1. Locate a Senior-level badge in UAT matching the above attributes.
2. Open its print view dialog.
3. Verify all steps are displayed with their labels and descriptions.
4. Confirm no activity-related UI elements or empty containers are rendered.

**Expected Result:** Only steps are shown; no empty activity containers, placeholder elements, or broken layout sections appear.

---

## TC-09: Badge with 3 or More Handouts

**Badge attributes required:**
- Program level: Brownie
- At least one step with activities
- A handouts section containing 3 or more handout items
- Each handout should have a title and downloadable/linked resource

**Steps:**
1. Locate a Brownie-level badge in UAT matching the above attributes.
2. Open its print view dialog.
3. Verify the handouts section is present and all 3+ handout items are listed.
4. Verify handout titles and any associated details are fully readable.
5. Confirm the handouts section layout matches the Figma design.

**Expected Result:** All handouts are listed correctly; the section fits within the print layout without content overflow or items being cut off.

---

## TC-09b: Badge Without a Handouts Section

**Badge attributes required:**
- Any program level
- One or more steps (with or without activities)
- No handouts section present

**Steps:**
1. Locate a badge in UAT with no handouts section.
2. Open its print view dialog.
3. Verify no handouts section, empty container, or placeholder element is rendered.
4. Confirm the rest of the layout is unaffected by the absence of handouts.

**Expected Result:** The print view renders cleanly with no empty or broken handouts-related UI elements.

---

## TC-10: Badge with Mixed Steps (Some Steps Without Activities)

**Badge attributes required:**
- Program level: Junior
- Multiple steps (3 or more)
- At least one step that has activities
- At least one step that has NO activities
- Both types present within the same badge

**Steps:**
1. Locate a Junior-level badge in UAT matching the above attributes.
2. Open its print view dialog.
3. For steps that have activities, confirm they display correctly.
4. For steps that do NOT have activities, confirm no broken or empty UI elements appear in place of activities.
5. Confirm the overall layout remains consistent regardless of whether a step has activities.

**Expected Result:** Mixed steps render cleanly; no empty blocks or layout breakage appear for activity-less steps, and activity-bearing steps display their content correctly.

---

## TC-10b: Activity with a Long Description

**Badge attributes required:**
- Any program level
- At least one step with one or more activities
- At least one activity has an unusually long description (significantly exceeding a typical short sentence)

**Steps:**
1. Locate or set up a badge in UAT where at least one activity has a long description.
2. Open its print view dialog.
3. Verify the full description is displayed without being truncated.
4. Confirm the description does not overflow its container or overlap adjacent elements.
5. Confirm the step and surrounding layout absorbs the extra content gracefully without breaking the overall print structure.

**Expected Result:** Long activity descriptions are fully readable, correctly contained, and do not cause layout breakage, overflow, or misalignment in the print view.

---

## TC-10c: Badge with Steps That Have No Activities

**Badge attributes required:**
- Any program level
- At least one step with no activities
- Other steps may optionally have activities

**Steps:**
1. Locate a badge in UAT with at least one step that has no activities.
2. Open its print view dialog.
3. Verify the bare step displays its title and description only.
4. Confirm no empty activity containers are rendered for that step.
5. Confirm surrounding steps are unaffected in layout.

**Expected Result:** Steps without activities render with only their available content; no empty containers, broken sections, or layout shifts occur.

---

## TC-10d: Badge with Activities but No Steps

**Badge attributes required:**
- Any program level
- No steps section present
- One or more activities listed directly at the badge level (outside of any step)
- Each activity has a description

**Steps:**
1. Locate a badge in UAT where activities exist but no steps section is present.
2. Open its print view dialog.
3. Verify activities are displayed with their descriptions.
4. Confirm no steps section, empty step containers, or step-related placeholders are rendered.
5. Confirm the layout matches the Figma design for this structure.

**Expected Result:** Activities render correctly at the badge level without any steps scaffolding; no broken or empty step-related elements appear in the print view.

---

## TC-10e: Badge Without a Groups Section

**Badge attributes required:**
- Any program level
- Steps with or without activities
- No groups section present on the badge

**Steps:**
1. Locate a badge in UAT that has no groups section.
2. Open its print view dialog.
3. Verify no groups section, empty container, or placeholder is rendered.
4. Confirm the rest of the layout is unaffected by the absence of groups.

**Expected Result:** The print view renders cleanly with no empty or broken groups-related UI elements.

---

## TC-11: Unpublished Fragments Are Hidden in Print View

**Precondition:** A badge page is available in UAT with at least one content fragment that can be toggled between published and unpublished states.  
**Steps:**
1. Open the badge page print view and note all displayed content. *(Before unpublishing)*
2. In AEM, unpublish one or more content fragments linked to this badge.
3. Clear any caches if applicable.
4. Re-open the badge page and trigger the print view dialog.
5. Verify the unpublished fragment does NOT appear.

**Expected Result:** Unpublished content is completely absent from the print view. No cached or stale content is shown.

---

## TC-12: Re-publishing Restores Content in Print View

**Precondition:** TC-11 has been executed (a fragment was unpublished).  
**Steps:**
1. Re-publish the previously unpublished content fragment in AEM.
2. Open the badge page and trigger the print view dialog.
3. Verify the fragment now appears again.

**Expected Result:** Re-published content is correctly restored in the print view.

---

## TC-13: AWS Queries AEM Publish Instance (Not Author)

**Precondition:** Access to network/request monitoring tools (e.g., browser DevTools or proxy).  
**Steps:**
1. Open a badge page and trigger the print view.
2. Inspect network requests made by the frontend.
3. Confirm requests are going to the **publish** AEM instance, not the author instance.
4. Cross-reference with the Badge GraphQL API endpoint in UAT to confirm the correct instance is targeted.

**Expected Result:** All GraphQL/API calls target the publish AEM instance, ensuring only published content is fetched.

---

## TC-14: Cross-Browser Compatibility

**Steps:**
1. Repeat TC-02, TC-03, and TC-05 on each of the following browsers:

**Expected Result:** Print view dialog opens correctly, matches the design, and PDF output is consistent across all tested browsers.

---

## TC-18: Cross-Device Testing (Physical Devices)

**Steps:**
1. Test on at least one physical iOS device and one Android device.
2. Open a badge page, trigger the print view.
3. Verify dialog behavior and layout.

**Expected Result:** Print view functions correctly on real devices without layout or interaction issues.

---

## Summary Matrix

| TC | Area | Priority |
|----|------|----------|
| TC-01 | Button visibility & clickability | High |
| TC-02 | Dialog trigger | High |
| TC-03 | Design match (Figma) | High |
| TC-04 | Physical print – Letter size | High |
| TC-05 | PDF save output | High |
| TC-06 | Badge – 3 steps with activities (Daisy) | Medium |
| TC-07 | Badge – 5 steps with activities (Brownie) | Medium |
| TC-08 | Badge – Steps only, no activities (Senior) | Medium |
| TC-09 | Badge – 3+ handouts (Brownie) | Medium |
| TC-09b | Badge – No handouts section | Medium |
| TC-10 | Badge – Mixed steps, some w/o activities (Junior) | Medium |
| TC-10b | Activity with a long description | Medium |
| TC-10c | Badge – Steps with no activities | Medium |
| TC-10d | Badge – Activities with no steps | Medium |
| TC-10e | Badge – No groups section | Medium |
| TC-11 | Unpublished fragments hidden | High |
| TC-12 | Re-publishing restores content | Medium |
| TC-13 | AWS queries publish AEM instance | High |
| TC-14 | Cross-browser | High |
| TC-15 | Cross-device (physical) | Medium |
